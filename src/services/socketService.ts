import { EventEmitter } from "events";
import { store } from "../store";
import { appSlice } from "../reducers/rootReducer";
import { RPCEvents, RPCCommands, CustomEvents } from "../constants/discord";
const {
  updateUser,
  removeUser,
  addUser,
  setAppUsers,
  setUserTalking,
  setReadyState,
  setIsAuthed,
  setPinned,
  setProfile,
  setClickThrough,
  setCurrentVoiceChannel,
} = appSlice.actions;

let instance;

// this lets us send messages back to the main electron process who also holds the discord socket
class IPCSocketService extends EventEmitter {
  private navigate: any;

  constructor() {
    super();

    window.electron.receive("fromMain", this.onMessage.bind(this));
  }

  init(nagivate: any) {
    this.send({ evt: "I_AM_READY" });
    this.navigate = nagivate;
  }

  /**
   * Send a message to the main process via IPC
   * @param message - Object
   */
  send(message: Object) {
    window.electron.send("toMain", message);
  }

  /**
   * Handles messages from the main process via IPC
   * @param {string} message
   */
  onMessage(message: any) {
    const packet = JSON.parse(message);
    const { evt, cmd = null, data } = packet;

    // if discord running send ready msg
    if (evt === "DISCORD_RUNNING") {
      this.send({ evt: "I_AM_READY" });
    }

    // if has lost connection to discord
    if (evt === "DISCONNECTED_FROM_DISCORD") {
      // reset vars
      store.dispatch(setIsAuthed(false));
      store.dispatch(setReadyState(false));
      store.dispatch(setProfile(null));
      store.dispatch(setCurrentVoiceChannel(null));
      store.dispatch(setAppUsers([]));

      // set route
      this.navigate("/failed");
    }

    // we get any ready data from main process
    if (evt === CustomEvents.READY) {
      store.dispatch(setIsAuthed(true));
      store.dispatch(setReadyState(true));
      store.dispatch(setProfile(data.profile));

      // set route
      this.navigate("/list");

    }

    // electron did the work for us and got a token ;)
    if (evt === CustomEvents.CLICKTHROUGH_STATUS) {
      store.dispatch(setClickThrough(packet.value));
    }

    // custom pin status from main proc
    if (evt === CustomEvents.PINNED_STATUS) {
      store.dispatch(setPinned(packet.value));
    }

    // get a current channel info and list of voice states
    if (cmd === RPCCommands.GET_SELECTED_VOICE_CHANNEL && data) {
      store.dispatch(setCurrentVoiceChannel(data));
      store.dispatch(setAppUsers(data.voice_states));
    }

    // get a list of the channel voice states
    if (evt === RPCEvents.GET_CHANNEL && data) {
      store.dispatch(setAppUsers(data.voice_states));
      store.dispatch(setCurrentVoiceChannel(data));
    }

    // start speaking
    if (evt === RPCEvents.SPEAKING_START) {
      store.dispatch(setUserTalking({ id: data.user_id, value: true }));
    }

    // stop speaking
    if (evt === RPCEvents.SPEAKING_STOP) {
      store.dispatch(setUserTalking({ id: data.user_id, value: false }));
    }

    // join
    if (evt === RPCEvents.VOICE_STATE_CREATE) {
      store.dispatch(addUser(data));
    }

    // leave
    if (evt === RPCEvents.VOICE_STATE_DELETE) {
      store.dispatch(removeUser(data.user.id));
    }

    if (evt === RPCEvents.VOICE_STATE_UPDATE) {
      store.dispatch(updateUser(data));
    }

    // for any external listeners
    this.emit("message", message);
  }

  // @ts-ignore
  on(event: "message", fnc: (msg: any) => void): this;

  /**
   * Remove all the attached listeners
   */
  // @ts-ignore
  removeAllListeners() {}
}

if (!instance) {
  instance = new IPCSocketService();
}

export default instance as IPCSocketService;
