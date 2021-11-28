import { IconButton, Tooltip } from "@mui/material";
import { darken } from "@mui/material/styles";
import IconSettings from "@mui/icons-material/Settings";
import IconHide from "@mui/icons-material/VisibilityOff";
import IconBack from "@mui/icons-material/ArrowBack";
import { useAppSelector } from "../hooks/redux";
import { RootState } from "../store";
import { styled } from "@mui/system";
import socketService from "../services/socketService";
import { CustomEvents } from "../constants/discord";
import { useLocation, useNavigate } from "react-router-dom";

const PREFIX = "Toolbar";
const classes = {
  root: `${PREFIX}-root`,
};

interface RootProps {
  clickThrough: boolean;
}

// Might be on the top tier cringe list for muiv5
const Root = styled("div", {
  shouldForwardProp: prop => prop !== "clickThrough",
})<RootProps>(({ theme, clickThrough }) => ({
  visibility: clickThrough ? "hidden" : "visible",
  display: "flex",
  justifyContent: "flex-end",
  flexDirection: "row",
  alignItems: "center",
  padding: "0 10px 0 10px",
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  // @ts-ignore
  appRegion: "drag",
  // HACK: maybe this works for the drag bug?
  "&:hover": {
    background: darken(theme.palette.primary.main, 0.1),
  },
  backgroundColor: theme.palette.primary.main,
  [`&.${classes.root}`]: {
    overflowY: "auto",
  },
}));

const Toolbar = () => {
  // TODO: Should this be once selecter pull?
  const channel = useAppSelector((state: RootState) => state.root.currentChannel);
  const isAuthed = useAppSelector((state: RootState) => state.root.isAuthed);
  const clickThrough = useAppSelector((state: RootState) => state.root.clickThrough);
  const navigate = useNavigate();
  const location = useLocation();

  const getTitle = () => {
    if (channel && channel.name) {
      return channel.name;
    } else if (!channel?.guild_id) {
      return "Private Call"
    } else {
      return "Overlayed";
    }
  };

  const isSettingsPage = location.pathname === "/settings";

  return (
    <Root clickThrough={clickThrough}>
      <div
        style={{
          textTransform: "uppercase",
          fontSize: 18,
          flex: 1,
          color: "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontWeight: "bold",
          // @ts-ignore
          appRegion: "drag",
        }}
      >
        {getTitle()}
      </div>
      <div
        style={{
          // @ts-ignore
          appRegion: "no-drag",
        }}
      >
        {(isAuthed && !isSettingsPage) && (
          <Tooltip arrow title="Enable clickthrough">
            <IconButton onClick={() => socketService.send({ event: CustomEvents.TOGGLE_CLICKTHROUGH })}>
              <IconHide color="secondary" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip arrow title={location.pathname === "/list" ? "Settings" : "Go Back"}>
          <IconButton onClick={() => {
            if (location.pathname === "/list") {
              navigate("settings");
            } else {
              navigate("list");
            }
          }}>
            { location.pathname === "/list" ? <IconSettings color="secondary" /> : <IconBack color="secondary" /> }
          </IconButton>
        </Tooltip>
      </div>
    </Root>
  );
};

export default Toolbar;
