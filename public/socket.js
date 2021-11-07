// socket on the main proc
const got = require("got");
const WebSocket = require("ws");

require("dotenv").config();

const { GUILD_ID, CLIENT_ID = "207646673902501888", ACCESS_TOKEN } = process.env;

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const getRPCEvents = id => [
  {
    cmd: "SUBSCRIBE",
    args: { channel_id: id },
    evt: "VOICE_STATE_CREATE",
    nonce: uuid(),
  },
  {
    cmd: "SUBSCRIBE",
    args: { channel_id: id },
    evt: "VOICE_STATE_DELETE",
    nonce: uuid(),
  },
  {
    cmd: "SUBSCRIBE",
    args: { channel_id: id },
    evt: "VOICE_STATE_UPDATE",
    nonce: uuid(),
  },
  {
    cmd: "SUBSCRIBE",
    args: { channel_id: id },
    evt: "SPEAKING_START",
    nonce: uuid(),
  },
  {
    cmd: "SUBSCRIBE",
    args: { channel_id: id },
    evt: "SPEAKING_STOP",
    nonce: uuid(),
  },
];

class SocketManager {
  /**
   * This is meant to send and recieve messages from the discord RPC
   * As well as relay the messages over IPC to the electron main/render processes
   */
  constructor({ win, overlayed }) {
    this._win = win;
    this.tries = 0;
    this._socket = null;
    this.overlayed = overlayed;

    this.connect();
  }

  connect() {
    const port = 6463 + (this.tries % 10);
    this.tries += 1;

    this._socket = new WebSocket(`ws://127.0.0.1:${port}/?v=1&client_id=${CLIENT_ID}`, {
      headers: {
        Origin: "https://streamkit.discord.com",
        Host: `127.0.0.1:${port}`,
      },
    });

    this._socket.on("open", this.open.bind(this));
    this._socket.on("close", this.close.bind(this));
    this._socket.on("message", this.onDiscordMessage.bind(this));
  }

  /**
   * Subscribe to events by channelId defined in getRPCEvents
   */
  subscribeEvents(channelId) {
    getRPCEvents(channelId).map(e => this._socket.send(JSON.stringify(e)));
  }

  /**
   * When we connect to the discord RPC websocket
   */
  open() {
    console.log("connected");
  }

  /**
   * When we disconnect from the discord RPC websocket
   */
  close(err) {
    console.log("disconnected", err);
  }

  /**
   * Send an auth request with a valid token to the discord RPC websocket
   */
  authenticate(token) {
    this.sendDiscordMessage({
      cmd: "AUTHENTICATE",
      args: { access_token: token },
      nonce: uuid(),
    });
  }

  /**
   * Receieve message from the electron renderer process
   * @param {string} message 
   */
  onElectronMessage(message) {
    const { event, data } = JSON.parse(message);

    if (event === "TOGGLE_DEVTOOLS") {
      this._win.webContents.openDevTools();
    }

    if (event === "I_AM_READY") {
    }

    if (event === "AUTH") {
      this.sendDiscordMessage(data);
    }

    // ask for the current channel from discord
    if (event === "REQUEST_CURRENT_CHANNEL") {
      this.requestCurrentChannel();
    }

    if (event === "SUBSCRIBE_CHANNEL") {
      const { channelId } = data;

      // request to sub to new channel events
      this.subscribeEvents(channelId);

      // ask for all the users?
      this.fetchUsers(channelId);
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
  async onDiscordMessage(message) {
    const packet = JSON.parse(message.toString());

    // we are ready, so send auth token
    if (packet.evt === "READY") {
      this.authenticate(ACCESS_TOKEN);
    }

    // store current channel in electron main
    if (packet.cmd === "GET_CHANNEL") {
      // attempt to save last channel id
      this.overlayed.lastChannelId = this.overlayed.curentChannelId;
      this.overlayed.curentChannelId = packet.data.id;
    }

    // we just got an auth token, get access token
    if (packet.cmd === "AUTHORIZE") {
      const response = await got("https://streamkit.discord.com/overlay/token", {
        method: "post",
        json: {
          code: packet.data.code,
        },
      }).json();

      // attempt to auth
      this.authenticate(response.access_token);

      // inform client of access token - should we though? really only electron needs it
      // TODO: client doesnt use the token but might be nice to have for now?
      this.sendElectronMessage({
        evt: "ACCESS_TOKEN_AQUIRED",
        data: {
          accessToken: response.access_token,
        },
      });
    }

    // handle no auth
    if (packet.cmd === "AUTHENTICATE" && packet.evt === "ERROR") {
      if (packet.data.code === 4009) {
        // TELL CLIENT WE AINT GOT NO AUTH :(
        console.log("We tried an auth token that was invalid");

        return this.sendElectronMessage(message.toString());
      }
    }

    // we are authed asked for currentChannel
    if (packet.cmd === "AUTHENTICATE") {
      // after auth request current channel
      this.requestCurrentChannel();
    }

    this.sendElectronMessage(message.toString());
  }


  fetchUsers(channelId) {
    this.sendDiscordMessage({
      cmd: "GET_CHANNEL",
      args: { channel_id: channelId },
      nonce: uuid(),
    });
  }

  requestCurrentChannel() {
    this.sendDiscordMessage({
      cmd: "GET_SELECTED_VOICE_CHANNEL",
      nonce: uuid(),
    });
  }

  /**
   * Send a message to electron main
   * @param {Object} data - the message to send in object format
   */
  sendElectronMessage(data) {
    this._win.webContents.send("fromMain", data);
  }

  /**
   * Send a message to discord socket
   * @param {Object} data - the message to send in object format
   */
  sendDiscordMessage(data) {
    this._socket.send(JSON.stringify(data));
  }

  /**
   * Destroy he discord websocket
   */
  destroy() {
    this._socket.close();
  }

  /**
   * When the discord websocket errors
   * @param {Error} event 
   */
  onError(event) {
    try {
      this._socket.close();
    } catch {} // eslint-disable-line no-empty

    if (this.tries > 20) {
      this.emit("error", event.error);
    } else {
      setTimeout(() => {
        this.connect();
      }, 250);
    }
  }
}

module.exports = SocketManager;
