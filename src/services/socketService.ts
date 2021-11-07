import { EventEmitter } from "events";
import { store } from "../store";
import { appSlice } from "../reducers/rootReducer";
import { RPCEvents, RPCCommands, CustomEvents } from "../constants/discord";

const {
  setCurrentVoiceChannel,
  setGuilds,
  setClientId,
  updateUser,
  removeUser,
  addUser,
  setAppUsers,
  setUserTalking,
  setReadyState,
  setAccessToken,
  setIsAuthed,
  setPinned,
} = appSlice.actions;

let instance;

// this lets us send messages back to the main electron process who also holds the discord socket
class IPCSocketService extends EventEmitter {
  constructor() {
    super();

    window.electron.receive("fromMain", this.onMessage.bind(this));
  }

  init() {
    this.send({ event: "I_AM_READY" });
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
    const { cmd, evt } = packet;

    // electron did the work for us and got a token ;)
    if (evt === CustomEvents.ACCESS_TOKEN_ACQUIRED) {
      store.dispatch(setAccessToken(packet.data.accessToken));
    }

    // custom pin status from main proc
    if (evt === CustomEvents.PINNED_STATUS) {
      store.dispatch(setPinned(packet.value));
    }

    // check for no auth or bad auth
    if (cmd === RPCCommands.AUTHENTICATE && RPCEvents.ERROR) {
      if (packet.data.code === 4009) {
        console.log("We received an authentication error with the token we provided");
        store.dispatch(setIsAuthed(false));
        return;
      }
    }

    // we get auth data
    if (cmd === RPCCommands.AUTHENTICATE) {
      store.dispatch(setClientId(packet.data.application.id));
      store.dispatch(setIsAuthed(true));
    }

    // get a list of the channel voice states
    if (cmd === RPCCommands.GET_CHANNEL) {
      store.dispatch(setAppUsers(packet.data.voice_states));
      store.dispatch(setReadyState(true));

      // TODO: figure out where to best set isAuthed
      store.dispatch(setIsAuthed(true));
    }

    // get current channel
    if (cmd === RPCCommands.GET_SELECTED_VOICE_CHANNEL) {
      store.dispatch(setCurrentVoiceChannel(packet.data));
      store.dispatch(setAppUsers([]));

      this.send({
        event: CustomEvents.SUBSCRIBE_CHANNEL,
        data: {
          channelId: packet.data.id,
        },
      });
    }

    // start speaking
    if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.SPEAKING_START) {
      store.dispatch(setUserTalking({ id: packet.data.user_id, value: true }));
    }

    // stop speaking
    if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.SPEAKING_STOP) {
      store.dispatch(setUserTalking({ id: packet.data.user_id, value: false }));
    }

    // join
    if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.VOICE_STATE_CREATE) {
      store.dispatch(addUser(packet.data));
    }

    // leave
    if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.VOICE_STATE_DELETE) {
      store.dispatch(removeUser(packet.data.user.id));
    }

    // FIXME: There is a rate limit on RPC for this to only allow update per 15 seconds
    // so when someone spams a mic/headphone mute it can bug the state in the UI as events dont get queued and sent to us
    // we just stop recieving events - not sure how to handle this?
    // update user info
    if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.VOICE_STATE_UPDATE) {
      store.dispatch(updateUser(packet.data));
    }

    // fetch all guilds and set to state
    if (cmd === RPCCommands.GET_GUILDS) {
      store.dispatch(setGuilds(packet.data.guilds));
    }

    // for any extneral listeners
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
