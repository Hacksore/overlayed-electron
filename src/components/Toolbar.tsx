import { IconButton } from "@mui/material";
import IconPin from "@mui/icons-material/PushPinRounded";
import IconSettings from "@mui/icons-material/Settings";
import IconDebug from "@mui/icons-material/BugReport";
import IconSync from "@mui/icons-material/Sync";
import { useAppSelector } from "../hooks/redux";
import { RootState } from "../store";
import { styled } from "@mui/system";
import socketService from "../services/socketService";
import { CustomEvents } from "../constants/discord";
import { nanoid } from "@reduxjs/toolkit";

const PREFIX = "Toolbar";
const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  flexDirection: "row",
  alignItems: "center",
  [`&.${classes.root}`]: {
    overflowY: "auto",
    height: "100vh",
  },
}));

const Toolbar = () => {
  const isPinned = useAppSelector((state: RootState) => state.root.isPinned);
  const channel = useAppSelector((state: RootState) => state.root.currentChannel);

  return (
    <Root>
      <div
        style={{
          textTransform: "uppercase",
          fontSize: 18,
          flex: 1,
          display: "flex",
          color: "#fff",
          // @ts-ignore
          WebkitAppRegion: "drag",
        }}
      >
        {/* TODO: fix for login window */}
        {channel && channel.name ? channel.name : "Private Call"}
      </div>
      <IconButton
        onClick={() => {
          socketService.send({ event: CustomEvents.REQUEST_CURRENT_CHANNEL });
        }}
      >
        <IconSync style={{ color: "#fff" }} />
      </IconButton>
      <IconButton onClick={() => window.electron.send("toMain", { event: "TOGGLE_DEVTOOLS" })}>
        <IconDebug style={{ color: "#fff" }} />
      </IconButton>
      <IconButton onClick={() => window.open("?test")}>
        <IconSettings style={{ color: "#fff" }} />
      </IconButton>
      <IconButton
        onClick={() => {
          // TODO: still borken
          socketService.send({ event: "TOGGLE_PIN" });

        }}
      >
        <IconPin style={{ color: isPinned ? "#73ef5b" : "#fff" }} />
      </IconButton>
    </Root>
  );
};

export default Toolbar;
