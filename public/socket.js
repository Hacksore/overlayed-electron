// socket on the main proc
const WebSocket = require("ws");
require("dotenv").config();

const { GUILD_ID, CLIENT_ID, CHANNEL_ID, ACCESS_TOKEN } = process.env;

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
  constructor(win) {
    this._win = win;

    this._socket = new WebSocket(`ws://127.0.0.1:6463/?v=1&client_id=${CLIENT_ID}`, {
      headers: {
        Origin: "https://streamkit.discord.com",
        Host: "https://streamkit.discord.com",
      },
    });

    this._socket.on("open", this.open.bind(this));
    this._socket.on("close", this.close.bind(this));
    this._socket.on("message", this.message.bind(this));
  }

  // sub to all the events
  subscribeEvents() {
    getRPCEvents(CHANNEL_ID).map(e => this._socket.send(JSON.stringify(e)));
  }

  open() {
    console.log("connected");
  }

  close(err) {
    console.log("disconnected", err);
  }

  message(data) {
    const packet = JSON.parse(data.toString());
    // we are ready, so send auth token
    if (packet.evt === "READY") {
      this._socket.send(
        JSON.stringify({
          cmd: "AUTHENTICATE",
          args: { access_token: ACCESS_TOKEN },
          nonce: uuid(),
        })
      );
    }

    // we are authed asked for channels and guilds ;)
    if (packet.cmd === "AUTHENTICATE") {
      // get users
      this.fetchUsers();

      // get guilds
      this.fetchGuilds();

      // sub to guild status
      this.fetchGuldStatus();

      // subscribe to channel for talking events
      this.subscribeEvents();
    }

    this._win.webContents.send("fromMain", data.toString());
  }

  fetchGuldStatus() {
    console.log("Fetching guild status..")
    this._socket.send(
      JSON.stringify({
        args: {
          guild_id: GUILD_ID,
        },  
        cmd: "SUBSCRIBE",
        evt: "GUILD_STATUS",
        nonce: uuid(),
      })
    );
  }

  fetchChannels() {
    this._socket.send(
      JSON.stringify({
        cmd: "GET_CHANNELS",
        args: { channel_id: GUILD_ID },
        nonce: uuid(),
      })
    );
  }

  fetchGuilds() {
    this._socket.send(
      JSON.stringify({
        cmd: "GET_GUILDS",
        args: {},
        nonce: uuid(),
      })
    );
  }

  fetchUsers() {
    this._socket.send(
      JSON.stringify({
        cmd: "GET_CHANNEL",
        args: { channel_id: CHANNEL_ID },
        nonce: uuid(),
      })
    );
  }

  destroy() {
    this._socket.close();
  }
}

module.exports = SocketManager;
