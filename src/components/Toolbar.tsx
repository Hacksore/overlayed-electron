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


interface RootProps {
  clickThrough: boolean;
};

// Might be on the top tier cringe list for muiv5
const Root = styled("div", {
  shouldForwardProp: (prop) => prop !== "clickThrough"
})<RootProps>(({ clickThrough }) => ({
  visibility: clickThrough ? "hidden" : "visible",
  display: "flex",
  justifyContent: "flex-end",
  flexDirection: "row",
  alignItems: "center",
  padding: "0 10px 0 10px",
  [`&.${classes.root}`]: {
    overflowY: "auto",
  },
  "&:hover": {
    cursor: "hand !important",
    background: "#495bfc",
  },
  backgroundColor: "#5c69ff",
}));

const Toolbar = () => {
  const isPinned = useAppSelector((state: RootState) => state.root.isPinned);
  const channel = useAppSelector((state: RootState) => state.root.currentChannel);
  const isAuthed = useAppSelector((state: RootState) => state.root.isAuthed);
  const clickThrough = useAppSelector((state: RootState) => state.root.clickThrough);

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
    <Root clickThrough={clickThrough}>
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
