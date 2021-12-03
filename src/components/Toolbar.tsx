import { IconButton, Tooltip } from "@mui/material";
import { darken } from "@mui/material/styles";
import IconSettings from "@mui/icons-material/Settings";
import IconHide from "@mui/icons-material/VisibilityOff";
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
const Root = styled("div")<RootProps>(({ theme, clickThrough }) => ({
  visibility: clickThrough ? "hidden" : "visible",
  display: "flex",
  justifyContent: "flex-end",
  flexDirection: "row",
  alignItems: "center",
  padding: "0 10px 0 10px",
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
  height: 40,
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
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === "/login";
  const isSettingsPage = location.pathname === "/settings";
  const isFailedPage = location.pathname === "/failed";

  const getTitle = () => {
    if (channel && channel.name) {
      return channel.name;
    } else if (channel && !channel?.guild_id && isAuthed) {
      return "Private Call";
    } else {
      return "Overlayed";
    }
  };

  const getSettingsText = () => {
    if (isSettingsPage) {
      return "Go Back";
    } else {
      return "Settings";
    }
  };

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
        {!isSettingsPage && !isLoginPage && !isFailedPage && (
          <Tooltip arrow title="Enable clickthrough">
            <IconButton onClick={() => socketService.send({ event: CustomEvents.TOGGLE_CLICKTHROUGH })}>
              <IconHide sx={{ color: "text.primary" }} />
            </IconButton>
          </Tooltip>
        )}

        {!isSettingsPage && (
          <Tooltip arrow title={getSettingsText()}>
            <IconButton
              onClick={() => {
                navigate("/settings");
              }}
            >
              <IconSettings sx={{ color: "text.primary" }} />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </Root>
  );
};

export default Toolbar;
