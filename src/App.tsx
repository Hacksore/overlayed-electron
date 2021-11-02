import { useEffect, useRef } from "react";
import UserItem from "./components/UserItem";
import { DiscordCMDEvents, DiscordRPCEvents } from "./constants/discord";
import { Root } from "./style";
import { IconButton } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { RootState } from "./store";
import { appSlice } from "./rootReducer";
import PinIcon from "@mui/icons-material/PushPinRounded";
import IconSettings from "@mui/icons-material/Settings";
import { IUser } from "./types/user";

const { updateUser, removeUser, addUser, setAppUsers, setUserTalking, setReadyState, setPinned } = appSlice.actions;
declare global {
  // TODO: type this as a proper type
  interface Window {
    electron: any;
  }
}

function App() {
  const dispatch = useAppDispatch();
  const isPinned = useAppSelector((state: RootState) => state.root.isPinned);
  const users = useAppSelector((state: RootState) => state.root.users);
  const viewRef = useRef(null);
  const usersRef = useRef(null);

  // we need users so lets hack with a ref?
  useEffect(() => {
    // @ts-ignore
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    // hey mr main I am ready
    window.electron.send("toMain", { event: "I_AM_READY" });
    // TODO: this has to be a singleton service I think - will look at working with IPCSocketService later
    // we end up with way to many stale closures with async callbacks like this that need to ready react state vars
    window.electron.receive("fromMain", (msg: any) => {
      const packet = JSON.parse(msg);
      const { cmd, evt } = packet;

      if (cmd === DiscordRPCEvents.GET_CHANNEL) {  
        dispatch(setAppUsers(packet.data.voice_states));
        dispatch(setReadyState(true));
      }

      if (cmd === DiscordCMDEvents.DISPATCH && evt === DiscordRPCEvents.SPEAKING_START) {
        dispatch(setUserTalking({ id: packet.data.user_id, value: true }));
      }

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
    });

    return () => {};

    // I think i need to understand if ignoring dispatch is a good idea
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Root>
      {/* // TODO: turn into toolbar component */}
      {/* TODO: would be nice to have this only show on hover maybe? */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div
          style={{
            textTransform: "uppercase",
            fontSize: 20,
            flex: 1,
            display: "flex",
            color: "#fff",
          }}
        >
          overlayed™
        </div>
        <IconButton>
          <IconSettings style={{ color: "#fff" }} />
        </IconButton>
        <IconButton
          onClick={() => {
            window.electron.send("toMain", { event: "TOGGLE_PIN" });
            dispatch(setPinned(!isPinned));
          }}
        >
          <PinIcon style={{ color: isPinned ? "#73ef5b" : "#fff" }} />
        </IconButton>
      </div>

      <div ref={viewRef} style={{ overflowY: "auto", height: "100vh" }}>
        {users.map((item: IUser) => (
          <UserItem
            key={item.id}
            nick={item.username}
            userId={item.id}
            avatarHash={item.avatarHash}
            isTalking={item.isTalking}
          />
        ))}
        {/* Testing the overflow */}
        {/* {Array(9)
          .fill(10)
          .map((u: any, i: any) => (
            <UserItem key={i} nick="bot" userId={i} avatarHash={i} isTalking={false} />
          ))} */}
      </div>
    </Root>
  );
}

export default App;
