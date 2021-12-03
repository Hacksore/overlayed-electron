const RPC = require("@hacksore/discord-rpc");

const { uuid } = require("./util");

// The overlayed prod client id
const CLIENT_ID = "905987126099836938";

// Events that we want to sub/unsub from
const SUBSCRIBABLE_EVENTS = [
  "VOICE_STATE_CREATE",
  "VOICE_STATE_DELETE",
  "VOICE_STATE_UPDATE",
  "SPEAKING_START",
  "SPEAKING_STOP",
];

class SocketManager {
  /**
   * This is meant to send and recieve messages from the discord RPC
   * As well as relay the messages over IPC to the electron main/render processes
   */
  constructor({ win, overlayed }) {
    this._win = win;
    this.overlayed = overlayed;
    this.client = new RPC.Client({ transport: "ipc" });
  }
  
  /**
   * Destory the connected client first then create a new one
   */
  resetClient() {
    this.client.destroy();
    this.client = new RPC.Client({ transport: "ipc" });
  }

  setupListeners() {
    // Try and close the connection first before reconnecting
    this.resetClient();

    this.client.on("ready", async () => {
      // sub to voice channel changes
      this.client.subscribe("VOICE_CHANNEL_SELECT");

      // Get the users currently joined channel
      this.client.send({ cmd: "GET_SELECTED_VOICE_CHANNEL", nonce: uuid() });

      // tell client we are ready
      this.sendElectronMessage({
        evt: "READY",
        data: {
          profile: this.client.user,
        },
      });

      // tell the main proc we are ready
      this._win.webContents.send("toMain", { evt: "CONNECTED_TO_DISCORD" });
    });

    // Log in to RPC with client id
    this.client.login({
      prompt: "none",
      scopes: ["rpc"],
      clientId: CLIENT_ID,
      accessToken: this.overlayed.auth.access_token,
    });

    this.client.on("error", async error => {
      console.log("error with rpc", error);
    });

    this.client.on("close", () => {
      console.log("Close event");
    });
    
    this.client.on("disconnected", () => {
      console.log("lost connection to discord");

      // TODO: sometimes this is called when we are in dev breaking the socket?
      // tell frontend we are disconnected
      // this.sendElectronMessage({
      //   evt: "DISCONNECTED_FROM_DISCORD",
      // });

    });

    this.client.on("message", this.onDiscordMessage.bind(this));
  }

  /**
   * Subscribe to events by channelId defined in getRPCEvents
   * @returns {Array} - an array of subscribed events
   */
  subscribeAllEvents(channelId) {
    SUBSCRIBABLE_EVENTS.map(eventName =>
      this.client.send({
        cmd: "SUBSCRIBE",
        args: { channel_id: channelId },
        evt: eventName,
        nonce: uuid(),
      })
    );
  }

  /**
   * Unsubscribe to events by channelId defined in getRPCEvents
   */
  unsubscribeAllEvents(channelId) {
    SUBSCRIBABLE_EVENTS.map(eventName =>
      this.client.send({
        cmd: "UNSUBSCRIBE",
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
  onElectronMessage(message) {
    const { event } = JSON.parse(message);

    if (event === "TOGGLE_DEVTOOLS") {
      this._win.webContents.openDevTools();
    }

    if (event === "TOGGLE_PIN") {
      this.overlayed.isPinned = !this.overlayed.isPinned;

      this._win.setAlwaysOnTop(this.overlayed.isPinned, "floating");
      this._win.setVisibleOnAllWorkspaces(true);
      this._win.setFullScreenable(false);

      this.sendElectronMessage({
        evt: "PINNED_STATUS",
        value: this.overlayed.isPinned,
      });
    }
  }

  /**
   * Receieve message from the discord RPC websocket
   * @param {string} message
   */
  onDiscordMessage(message) {
    const { evt, cmd, data } = message;

    if (evt === "VOICE_CHANNEL_SELECT") {
      // attempt to unsub prior channel if found
      if (this.overlayed.lastChannelId) {
        this.unsubscribeAllEvents(this.overlayed.lastChannelId);
      }

      this.client.send({ cmd: "GET_SELECTED_VOICE_CHANNEL", nonce: uuid() });

      this.overlayed.lastChannelId = this.overlayed.curentChannelId;
      this.overlayed.curentChannelId = data.channel_id;
    }

    // sub to channel events
    if (cmd === "GET_SELECTED_VOICE_CHANNEL" && data) {
      this.subscribeAllEvents(data.id);
    } else if (cmd === "GET_SELECTED_VOICE_CHANNEL" && !data) {
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
  sendElectronMessage(message) {
    this._win.webContents.send("fromMain", JSON.stringify(message));
  }
}

module.exports = SocketManager;
