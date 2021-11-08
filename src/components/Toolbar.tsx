import { IconButton } from "@mui/material";
import IconPin from "@mui/icons-material/PushPinRounded";
import IconDebug from "@mui/icons-material/BugReport";
import IconSync from "@mui/icons-material/Refresh";
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
  padding: "0 10px 0 10px",
  [`&.${classes.root}`]: {
    overflowY: "auto",
  },
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
}));

const Toolbar = () => {
  const isPinned = useAppSelector((state: RootState) => state.root.isPinned);
  const channel = useAppSelector((state: RootState) => state.root.currentChannel);
  const isAuthed = useAppSelector((state: RootState) => state.root.isAuthed);

  const getTitle = () => {
    if (channel && channel.name) {
      return channel.name;
    } else if (!channel && !isAuthed) {
      return "Overlayed";
    } else if (!channel && isAuthed) {
      // if they are authed but don't have a channel, then they are a private call
      return "Private call";
    }
  };

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
          appRegion: "drag",
        }}
      >
        {getTitle()}
      </div>
      <IconButton
        onClick={() => {
          socketService.send({ event: CustomEvents.REQUEST_CURRENT_CHANNEL });
        }}
      >
        <IconSync style={{ color: "#fff" }} />
      </IconButton>
      <IconButton onClick={() => socketService.send({ event: CustomEvents.TOGGLE_DEVTOOLS })}>
        <IconDebug style={{ color: "#fff" }} />
      </IconButton>
      <IconButton onClick={() => socketService.send({ event: CustomEvents.TOGGLE_PIN })}>
        <IconPin style={{ color: isPinned ? "#73ef5b" : "#fff" }} />
      </IconButton>
    </Root>
  );
};

export default Toolbar;
