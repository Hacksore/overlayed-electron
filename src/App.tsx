import { useEffect } from "react";
import { DiscordCMDEvents, DiscordRPCEvents } from "./constants/discord";
import { Root } from "./style";
import { useAppDispatch } from "./hooks/redux";
import { appSlice } from "./rootReducer";
import Toolbar from "./components/Toolbar";
import UserList from "./components/UserList";

const {
  setGuilds,
  setClientId,
  updateUser,
  removeUser,
  addUser,
  setAppUsers,
  setUserTalking,
  setReadyState,
} = appSlice.actions;
declare global {
  interface Window {
    electron: {
      send: Function;
      receive: Function;
    };
  }
}

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Tell main we are ready
    window.electron.send("toMain", { event: "I_AM_READY" });

    window.electron.receive("fromMain", (msg: string) => {
      const packet = JSON.parse(msg);
      const { cmd, evt } = packet;

      // we get auth data
      if (cmd === DiscordRPCEvents.AUTHENTICATE) {
        dispatch(setClientId(packet.data.application.id));
      }

      // get a list of the channel voice states
      if (cmd === DiscordRPCEvents.GET_CHANNEL) {
        dispatch(setAppUsers(packet.data.voice_states));
        dispatch(setReadyState(true));
      }

      // start speaking
      if (cmd === DiscordCMDEvents.DISPATCH && evt === DiscordRPCEvents.SPEAKING_START) {
        dispatch(setUserTalking({ id: packet.data.user_id, value: true }));
      }

      // stop speaking
      if (cmd === DiscordCMDEvents.DISPATCH && evt === DiscordRPCEvents.SPEAKING_STOP) {
        dispatch(setUserTalking({ id: packet.data.user_id, value: false }));
      }

      // join
      if (cmd === DiscordCMDEvents.DISPATCH && evt === DiscordRPCEvents.VOICE_STATE_CREATE) {
        dispatch(addUser(packet.data));
      }

      // leave
      if (cmd === DiscordCMDEvents.DISPATCH && evt === DiscordRPCEvents.VOICE_STATE_DELETE) {
        dispatch(removeUser(packet.data.user.id));
      }

      // update user info
      if (cmd === DiscordCMDEvents.DISPATCH && evt === DiscordRPCEvents.VOICE_STATE_UPDATE) {
        dispatch(updateUser(packet.data));
      }

      // Info about current connected guild?
      if (cmd === DiscordCMDEvents.DISPATCH && evt === DiscordRPCEvents.GUILD_STATUS) {
        // console.log("gs", packet);
      }

      // fetch all guilds and set to state
      if (cmd === DiscordCMDEvents.GET_GUILDS) {
        dispatch(setGuilds(packet.data.guilds));
      }
    });

    return () => {};

    // I think i need to understand if ignoring dispatch is a good idea
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Root>
      <Toolbar />
      <UserList />
      
    </Root>
  );
}

export default App;
