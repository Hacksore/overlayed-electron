import { useEffect, useState } from "react";
import { RPCEvents, RPCCommands, CustomEvents } from "./constants/discord";
import { Root } from "./style";
import { useAppDispatch } from "./hooks/redux";
import { appSlice } from "./reducers/rootReducer";
import Toolbar from "./components/Toolbar";
import UserList from "./components/UserList";
import LoginView from "./components/LoginView";

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

  // TODO: move to redux
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // Tell main we are ready
    window.electron.send("toMain", { event: "I_AM_READY" });

    window.electron.receive("fromMain", (msg: string) => {
      const packet = JSON.parse(msg);
      const { cmd, evt } = packet;

      // electron did the work for us and got a token ;)
      if (evt === CustomEvents.ACCESS_TOKEN_AQUIRED) {
        dispatch(setAccessToken(packet.data.accessToken));
      }

      // check for no auth or bad auth
      if (cmd === RPCCommands.AUTHENTICATE && RPCEvents.ERROR) {
        if (packet.data.code === 4009) {
          console.log("We have bad authz, make client login somehow :(");
          setAuthed(false);
          return;
        }
      }

      // we get auth data
      if (cmd === RPCCommands.AUTHENTICATE) {
        dispatch(setClientId(packet.data.application.id));
        setAuthed(true);
      }

      // get a list of the channel voice states
      if (cmd === RPCCommands.GET_CHANNEL) {
        dispatch(setAppUsers(packet.data.voice_states));
        dispatch(setReadyState(true));
      }

      // get current channel
      if (cmd === RPCCommands.GET_SELECTED_VOICE_CHANNEL) {
        console.log("Got current chan", packet);
        dispatch(setCurrentVoiceChannel(packet.data));
        dispatch(setAppUsers([]));

        window.electron.send("toMain", {
          event: "SUBSCRIBE_CHANNEL",
          data: {
            channelId: packet.data.id,
          },
        });
      }

      // start speaking
      if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.SPEAKING_START) {
        dispatch(setUserTalking({ id: packet.data.user_id, value: true }));
      }

      // stop speaking
      if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.SPEAKING_STOP) {
        dispatch(setUserTalking({ id: packet.data.user_id, value: false }));
      }

      // join
      if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.VOICE_STATE_CREATE) {
        dispatch(addUser(packet.data));
      }

      // leave
      if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.VOICE_STATE_DELETE) {
        dispatch(removeUser(packet.data.user.id));
      }

      // update user info
      if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.VOICE_STATE_UPDATE) {
        dispatch(updateUser(packet.data));
      }

      // Info about current connected guild?
      if (cmd === RPCCommands.DISPATCH && evt === RPCEvents.GUILD_STATUS) {
        // console.log("gs", packet);
      }

      // fetch all guilds and set to state
      if (cmd === RPCCommands.GET_GUILDS) {
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
      {!authed ? (
        <LoginView />
      ) : (
        <>
          <UserList />
        </>
      )}
    </Root>
  );
}

export default App;
