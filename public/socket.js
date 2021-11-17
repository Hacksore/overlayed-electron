const RPC = require("discord-rpc");

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
    this.client = null;

    this.connect();
  }

  connect() {
    this.client = new RPC.Client({ transport: "ipc" });
  }

  setupAuthAndListeners() {
    this.client.on("ready", async () => {

      // sub to channel changes
      this.client.subscribe("VOICE_CHANNEL_SELECT", this.onDiscordMessage.bind(this, "VOICE_CHANNEL_SELECT"));

      // handle the event
      this.client.on("VOICE_CHANNEL_SELECT", event => {
        this.subscribeAllEvents(event.channel_id);
        this.onDiscordMessage("VOICE_CHANNEL_SELECT", event);
      });

      // Sub to channel events
      SUBSCRIBABLE_EVENTS.forEach(eventName => {
        this.client.on(eventName, this.onDiscordMessage.bind(this, eventName));
      });

      // how to get current voice channel
      const channelData = await this.client.request("GET_SELECTED_VOICE_CHANNEL");
      this.onDiscordMessage("GET_SELECTED_VOICE_CHANNEL", channelData);
      this.subscribeAllEvents(channelData.id);

      // tell client we are ready
      this.sendElectronMessage({
        event: "READY",
        data: {
          profile: this.client.user,
        },
      });
    });

    // Log in to RPC with client id
    this.client.login({
      prompt: "none",
      scopes: ["rpc"],
      clientId: CLIENT_ID,
      accessToken: this.overlayed.auth.access_token,
    });
  }

  /**
   * Subscribe to events by channelId defined in getRPCEvents
   */
  subscribeAllEvents(channelId) {
    SUBSCRIBABLE_EVENTS.map(eventName => this.client.subscribe(eventName, { channel_id: channelId }));
  }

  /**
   * Receieve message from the electron renderer process
   * @param {string} message
   */
  onElectronMessage(message) {
    const { event, data } = JSON.parse(message);
    console.log(event, data);
  }

  /**
   * Receieve message from the discord RPC websocket
   * @param {string} message
   */
  async onDiscordMessage(event, packet) {
    console.log(event, packet);

    // forward every packet from the socket to the client
    this.sendElectronMessage({ event, data: packet });
  }

  /**
   * Send a message to electron renderer process
   * @param {Object} message - the message to send in object format
   */
  sendElectronMessage(message) {
    this._win.webContents.send("fromMain", JSON.stringify(message));
  }

  /**
   * Send a message to discord socket
   * @param {Object} message - the message to send in object format
   */
  sendDiscordMessage(message) {
    this._socket.send(JSON.stringify(message));
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
  onError(event) {}

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
}

module.exports = SocketManager;
