import { IconButton } from "@mui/material";
import IconPin from "@mui/icons-material/PushPinRounded";
import IconDebug from "@mui/icons-material/BugReport";
import IconSync from "@mui/icons-material/Sync";
import { useAppSelector } from "../hooks/redux";
import { RootState } from "../store";
import { styled } from "@mui/system";
import socketService from "../services/socketService";
import { CustomEvents } from "../constants/discord";

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
  const isAuthed = useAppSelector((state: RootState) => state.root.isAuthed);

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
        {/* Render name of channel */}
        {channel && channel.name}

        {/* When not authed show app name */}
        {!isAuthed && "Overlayed"}
      </div>
      <IconButton
        onClick={() => {
          socketService.send({ event: CustomEvents.REQUEST_CURRENT_CHANNEL });
        }}
      >
        <IconSync style={{ color: "#fff" }} />
      </IconButton>
      <IconButton onClick={() => socketService.send({ event: "TOGGLE_DEVTOOLS" })}>
        <IconDebug style={{ color: "#fff" }} />
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
