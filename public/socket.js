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

// This is meant ot send and recieve messages from the discord RPC
// TODO: make it scan for port ranges from [6463, 6472] - prolly can use makeRange
class SocketManager {
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
    this._socket.on("message", this.message.bind(this));
  }

  // sub to all the events
  subscribeEvents(channelId) {
    getRPCEvents(channelId).map(e => this._socket.send(JSON.stringify(e)));
  }

  open() {
    console.log("connected");
  }

  close(err) {
    console.log("disconnected", err);
  }

  authenticate(token) {
    this.sendDiscordMessage({
      cmd: "AUTHENTICATE",
      args: { access_token: token },
      nonce: uuid(),
    });
  }

  /**
   * An IPC message is a something that is render process to the main
   */
  onIPCMessage(message) {
    const { event, data } = JSON.parse(message);
    
    if (event === "TOGGLE_DEVTOOLS") {
      this._win.webContents.openDevTools();
    }

    // IDK?
    if (event === "I_AM_READY") {
    }

    // Allow the main process to proxy a message straight to the discord RPC socket
    // we just pass the full data message
    if (event === "DISCORD_RPC") {
      // TODO: why are we having to to string this?
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

  async message(data) {
    const packet = JSON.parse(data.toString());
    console.log(packet);

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

    // we just got an code, get access token with it
    if (packet.cmd === "AUTHORIZE" && packet.evt !== "ERROR") {
      const response = await got("https://streamkit.discord.com/overlay/token", {
        method: "post",
        json: {
          code: packet.data.code,
        },
      }).json();

      console.log("Just got a token from discord", response.access_token)

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

    // handle auth errors
    if (packet.cmd === "AUTHENTICATE") {
      if (packet.evt === "ERROR") {
        if (packet.data.code === 4002) {
          console.log("We are already authed");
        }

        // TELL CLIENT WE AINT GOT NO AUTH :(
        if (packet.data.code === 4009) {
          console.log("We tried an auth token that was invalid");
        }
      } else {
        // we already are authed lets get the otken
        console.log("already have auth token that works", packet.data);
        this.overlayed.accessToken = packet.data.access_token;
      }
    }

    this.sendElectronMessage(data);
  }

  fetchGuldStatus() {
    this.sendDiscordMessage({
      args: {
        guild_id: GUILD_ID,
      },
      cmd: "SUBSCRIBE",
      evt: "GUILD_STATUS",
      nonce: uuid(),
    });
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
    this._win.webContents.send("fromMain", data.toString());
  }

  /**
   * Send a message to discord socket
   * @param {Object} data - the message to send in object format
   */
  sendDiscordMessage(data) {
    this._socket.send(JSON.stringify(data));
  }

  destroy() {
    this._socket.close();
  }

  onError(event) {
    try {
      this._socket.close();
    } catch {}

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
