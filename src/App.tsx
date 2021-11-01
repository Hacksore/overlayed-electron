import { useEffect, useRef, useState } from "react";
import UserItem from "./components/UserItem";
import { DiscordCMDEvents, DiscordRPCEvents } from "./constants/discord";
// import IPCSocketService from "./services/socketService";
import { insertItemAtIndex } from "./utils";
import { Root } from "./style";
import { IconButton } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { RootState } from "./store";
import { appSlice } from "./rootReducer";
import PinIcon from "@mui/icons-material/PushPinRounded";
import IconSettings from "@mui/icons-material/Settings";

const { setAppUsers, setReadyState, setPinned } = appSlice.actions;
declare global {
  // TODO: type this as a proper type
  interface Window {
    electron: any;
  }
}

function App() {
  const [users, setUsers] = useState([]);
  const dispatch = useAppDispatch();
  const isPinned = useAppSelector((state: RootState) => state.root.isPinned);
  const viewRef = useRef(null);

  useEffect(() => {
    // hey mr main I am ready
    window.electron.send("toMain", { event: "I_AM_READY" });
    // TODO: this has to be a singleton service I think - will look at working with IPCSocketService later
    // we end up with way to many stale closures with async callbacks like this that need to ready react state vars
    window.electron.receive("fromMain", (msg: any) => {
      const packet = JSON.parse(msg);

      if (packet.cmd === DiscordRPCEvents.GET_CHANNEL) {
        setUsers(packet.data.voice_states);

        dispatch(setAppUsers(packet.data.voice_states));
        dispatch(setReadyState(true));
      }

      if (
        packet.cmd === DiscordCMDEvents.DISPATCH &&
        packet.evt === DiscordRPCEvents.SPEAKING_START
      ) {
        setUsers(userList => {
          const clonedUserList = [...userList];
          clonedUserList.forEach((u: any) => {
            if (u.user.id === packet.data.user_id) {
              u.isTalking = true;
            }
          });
          return clonedUserList;
        });
      }

      if (
        packet.cmd === DiscordCMDEvents.DISPATCH &&
        packet.evt === DiscordRPCEvents.SPEAKING_STOP
      ) {
        setUsers(userList => {
          const clonedUserList = [...userList];
          clonedUserList.forEach((u: any) => {
            if (u.user.id === packet.data.user_id) {
              u.isTalking = false;
            }
          });
          return clonedUserList;
        });
      }

      // join
      if (
        packet.cmd === DiscordCMDEvents.DISPATCH &&
        packet.evt === DiscordRPCEvents.VOICE_STATE_CREATE
      ) {
        // @ts-ignore
        setUsers((userList: any) => {
          return [...userList, packet.data];
        });
      }

      // leave
      if (
        packet.cmd === DiscordCMDEvents.DISPATCH &&
        packet.evt === DiscordRPCEvents.VOICE_STATE_DELETE
      ) {
        setUsers((userList: any) => userList.filter((u: any) => u.user.id !== packet.data.user.id));
      }

      // update user info
      if (
        packet.cmd === DiscordCMDEvents.DISPATCH &&
        packet.evt === DiscordRPCEvents.VOICE_STATE_UPDATE
      ) {
        // @ts-ignore
        setUsers((userList: any) => {
          // preserve last index so they dont move around
          const lastIndex = userList.findIndex((u: any) => u.user.id === packet.data.user.id);
          const oldUsers = userList.filter((u: any) => u.user.id !== packet.data.user.id);
          return insertItemAtIndex([...oldUsers], lastIndex, packet.data);
        });
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
      <div style={{ display: "flex", justifyContent: "flex-end", flexDirection: "row" }}>
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
        {users.map((u: any) => (
          <UserItem
            key={u.user.id}
            nick={u.nick}
            userId={u.user.id}
            avatarHash={u.user.avatar}
            isTalking={u.isTalking}
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
