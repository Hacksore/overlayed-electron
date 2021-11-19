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
      this.onReady();

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

    this.client.on("error", async error => {
      console.log("error with rpc", error);
    });
  }

  async onReady() {
    // sub to channel changes for the current user
    this.client.subscribe("VOICE_CHANNEL_SELECT");

    // called when the user joins/switches channels
    this.client.on("VOICE_CHANNEL_SELECT", async event => {

      console.log("VOICE_CHANNEL_SELECT", event);

      // unsub from old channels first!
      // TODO: figure out how to unsub from old channels
      // if (this.overlayed.subscriptions) {
      //   this.overlayed.subscriptions.map(async subscription => {
      //     if (subscription) {
      //       const item = await subscription;
      //       item.unsubscribe();
      //     }
      //   });
      // }

      // Get the users currently joined channel and send info
      const channelData = await this.client.request("GET_CHANNEL", { channel_id: event.channel_id });
      console.log(channelData);
      this.sendElectronMessage({ event: "GET_CHANNEL", data: channelData });

      this.overlayed.subscriptions = this.subscribeAllEvents(event.channel_id);
      this.onDiscordMessage("VOICE_CHANNEL_SELECT", event);

      // Sub to channel events
      SUBSCRIBABLE_EVENTS.forEach(eventName => {
        this.client.on(eventName, this.onDiscordMessage.bind(this, eventName));
      });
    });

    // Get the users currently joined channel
    const channelData = await this.client.request("GET_SELECTED_VOICE_CHANNEL");
    if (channelData.id) {
      this.onDiscordMessage("GET_SELECTED_VOICE_CHANNEL", channelData);
      // this.overlayed.subscriptions = this.subscribeAllEvents(channelData.id);
    }
  }

  /**
   * Subscribe to events by channelId defined in getRPCEvents
   * @returns {Array} - an array of subscribed events
   */
  subscribeAllEvents(channelId) {
    return SUBSCRIBABLE_EVENTS.map(eventName => this.client.subscribe(eventName, { channel_id: channelId }));
  }

  /**
   * Receieve message from the electron renderer process
   * @param {string} message
   */
  onElectronMessage(message) {
    const { event, data } = JSON.parse(message);
    // console.log(event, data);
  }

  /**
   * Receieve message from the discord RPC websocket
   * @param {string} message
   */
  async onDiscordMessage(event, packet) {
    console.log(event);

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
