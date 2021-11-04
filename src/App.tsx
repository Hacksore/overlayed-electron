import { useEffect } from "react";
import UserItem from "./components/UserItem";
import { DiscordCMDEvents, DiscordRPCEvents } from "./constants/discord";
import { Root } from "./style";
import { Button, IconButton, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./hooks/redux";
import { RootState } from "./store";
import { appSlice } from "./rootReducer";
import PinIcon from "@mui/icons-material/PushPinRounded";
import IconSettings from "@mui/icons-material/Settings";
import { IUser } from "./types/user";

const { setClientId, updateUser, removeUser, addUser, setAppUsers, setUserTalking, setReadyState, setPinned } = appSlice.actions;
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
  const isPinned = useAppSelector((state: RootState) => state.root.isPinned);
  const users = useAppSelector((state: RootState) => state.root.users);
  const clientId = useAppSelector((state: RootState) => state.root.clientId);

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

      // guilds test
      if (cmd === DiscordCMDEvents.DISPATCH && evt === "GET_GUILDS") {
        console.log("GUOLDS", packet);
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
        <IconButton onClick={() => window.electron.send("toMain", { event: "TOGGLE_DEVTOOLS" })}>
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

      <div style={{ overflowY: "auto", height: "100vh" }}>
        {users.map((item: IUser) => (
          <UserItem key={item.id} {...item} />
        ))}

        {/* TODO: add a FTUE component and a sync component */}
        {users.length <= 0 && (
          <div>
            <Typography color="primary">Sync current channel</Typography>
            <Button
              onClick={() => {
                console.log(1);
                // find channel im in and then tell electron to call subscribeEvents
                // const user = users.find(item => )

                // window.electron.send("toMain", { event: "SUBSCRIBE_EVENTS", channelId:  });
              }}
              variant="contained"
            >
              Click here to sync
            </Button>
          </div>
        )}
      </div>
    </Root>
  );
}

export default App;
