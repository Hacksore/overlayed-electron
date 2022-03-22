import RPCClient from "../common/ipc/client";
import { BrowserWindow } from "electron";
import { uuid } from "../common/util";
import { CustomEvents } from "../common/constants";
import { RPCCommands, RPCEvents } from "../common/ipc/constants";
import log from "electron-log";

// The overlayed prod client id
const CLIENT_ID = "905987126099836938";

// Events that we want to sub/unsub from
const SUBSCRIBABLE_EVENTS = [
  RPCEvents.VOICE_STATE_CREATE,
  RPCEvents.VOICE_STATE_DELETE,
  RPCEvents.VOICE_STATE_UPDATE,
  RPCEvents.SPEAKING_START,
  RPCEvents.SPEAKING_STOP,
];

class SocketManager {
  private _win: BrowserWindow;
  private overlayed: any;
  private client: any;

  /**
   * This is meant to send and recieve messages from the discord RPC
   * As well as relay the messages over IPC to the electron main/render processes
   */
  constructor({ win, overlayed }: { win: BrowserWindow | null; overlayed: any }) {
    this._win = win;
    this.overlayed = overlayed;
    this.client = new RPCClient();
  }

  /**
   * Destory the connected client first then create a new one
   */
  resetClient() {
    this.client.destroy();
    this.client = new RPCClient();
  }

  setupListeners() {
    // Try and close the connection first before reconnecting
    this.resetClient();

    this.client.on("ready", async () => {
      log.debug("got ready event from the IPC");

      // sub to voice channel changes
      this.client.subscribe(RPCEvents.VOICE_CHANNEL_SELECT);

      // Get the users currently joined channel
      this.client.send({ cmd: RPCCommands.GET_SELECTED_VOICE_CHANNEL, nonce: uuid() });

      // tell client we are ready
      this.sendElectronMessage({
        evt: CustomEvents.READY,
        data: {
          profile: this.client.user,
        },
      });

      // tell the main proc we are ready
      this.sendElectronMessage({ evt: CustomEvents.CONNECTED_TO_DISCORD });
    });

    // Log in to RPC with client id
    this.client.login({
      prompt: "none",
      scopes: ["rpc"],
      clientId: CLIENT_ID,
      accessToken: this.overlayed.auth.access_token,
    });

    log.debug("Logging in with auth token", this.overlayed.auth.access_token);

    this.client.on("error", async (error: Error) => {
      log.info("error with rpc", error);

      // tell client that the auth token we used is no longer valid
      this.sendElectronMessage({
        evt: CustomEvents.AUTH_TOKEN_INVALID,
        data: {
          error: error.message,
        },
      });
    });

    this.client.on("close", () => {
      log.debug("lost connection to discord");

      this.sendElectronMessage({
        evt: CustomEvents.DISCONNECTED_FROM_DISCORD,
      });
    });

    this.client.on("disconnected", () => {
      log.debug("lost connection to discord");

      // tell frontend we are disconnected
      this.sendElectronMessage({
        evt: CustomEvents.DISCONNECTED_FROM_DISCORD,
      });
    });

    this.client.on("message", this.onDiscordMessage.bind(this));
  }

  /**
   * Subscribe to events by channelId defined in getRPCEvents
   * @returns {Array} - an array of subscribed events
   */
  subscribeAllEvents(channelId: string) {
    SUBSCRIBABLE_EVENTS.map(eventName =>
      this.client.send({
        cmd: RPCCommands.SUBSCRIBE,
        args: { channel_id: channelId },
        evt: eventName,
        nonce: uuid(),
      })
    );
  }

  /**
   * Unsubscribe to events by channelId defined in getRPCEvents
   */
  unsubscribeAllEvents(channelId: string) {
    SUBSCRIBABLE_EVENTS.map(eventName =>
      this.client.send({
        cmd: RPCCommands.UNSUBSCRIBE,
        args: { channel_id: channelId },
        evt: eventName,
        nonce: uuid(),
      })
    );
  }

  /**
   * Receieve message from the electron renderer process
   * @param {string} message
   */
  onElectronMessage(message: string) {
    const { event } = JSON.parse(message);

    if (event === CustomEvents.TOGGLE_DEVTOOLS) {
      this._win.webContents.openDevTools();
    }

    if (event === CustomEvents.TOGGLE_PIN) {
      this.overlayed.isPinned = !this.overlayed.isPinned;

      this._win.setAlwaysOnTop(this.overlayed.isPinned, "floating");
      this._win.setVisibleOnAllWorkspaces(true);
      this._win.setFullScreenable(false);

      this.sendElectronMessage({
        evt: CustomEvents.PINNED_STATUS,
        value: this.overlayed.isPinned,
      });
    }
  }

  /**
   * Receieve message from the discord RPC websocket
   * @param {Object} message
   */
  onDiscordMessage(message: any) {
    const { evt, cmd, data } = message;
    log.debug(message);

    if (evt === RPCEvents.VOICE_CHANNEL_SELECT) {
      // attempt to unsub prior channel if found
      if (this.overlayed.lastChannelId) {
        this.unsubscribeAllEvents(this.overlayed.lastChannelId);
      }

      this.client.send({ cmd: RPCCommands.GET_SELECTED_VOICE_CHANNEL, nonce: uuid() });

      this.overlayed.lastChannelId = this.overlayed.curentChannelId;
      this.overlayed.curentChannelId = data.channel_id;
    }

    // sub to channel events
    if (cmd === RPCCommands.GET_SELECTED_VOICE_CHANNEL && data) {
      this.subscribeAllEvents(data.id);
    } else if (cmd === RPCCommands.GET_SELECTED_VOICE_CHANNEL && !data) {
      // we dont have a channel so we must have left vc?
      this.unsubscribeAllEvents(this.overlayed.lastChannelId);
      this.overlayed.lastChannelId = null;
      this.overlayed.curentChannelId = null;
    }

    // forward every packet from the socket to the client
    this.sendElectronMessage(message);
  }

  /**
   * Send a message to electron renderer process
   * @param {Object} message - the message to send in object format
   */
  sendElectronMessage(message: any) {
    this._win.webContents.send("fromMain", JSON.stringify(message));
  }

  /**
   * Send a message to discord
   * @param {String} cmd - the message cmd to send
   *
   */
  sendDiscordMessage({ cmd, args }: { cmd: string; args: any }) {
    this.client.send({ cmd, args, nonce: uuid() });
  }
}

export default SocketManager;
