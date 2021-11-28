import { Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect } from "react";
import { CustomEvents } from "../constants/discord";
import IconConsole from "@mui/icons-material/Code";
import socketService from "../services/socketService";

const PREFIX = "Settings";
const classes = {
  root: `${PREFIX}-root`,
  soonTM: `${PREFIX}-soontm`,
};

export const Root = styled("div")(({ theme }) => ({
  padding: 16,
  background: theme.palette.background.default,
  color: theme.palette.primary.contrastText,
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  height: 400,
  [`& .${classes.soonTM}`]: {
    color: "lime",
  },
}));

const SettingsView = () => {
  useEffect(() => {
    socketService.send({ evt: "WINDOW_RESIZE", data: { height: 500 } });
  }, []);

  return (
    <Root>
      <Typography gutterBottom variant="h5" color="textPrimary">
        Settings
      </Typography>
      <Typography gutterBottom variant="subtitle2" color="textPrimary">
        Configure various settings for overlayed
      </Typography>

      <div style={{ marginTop: "auto" }}>
        <Button variant="contained" onClick={() => socketService.send({ event: CustomEvents.TOGGLE_DEVTOOLS })}>
          <IconConsole color="secondary" /> Toggle Dev Tools
        </Button>
      </div>
    </Root>
  );
};

export default SettingsView;
