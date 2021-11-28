import { Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect } from "react";
import { CustomEvents } from "../constants/discord";
import IconConsole from "@mui/icons-material/Code";
import IconTrash from "@mui/icons-material/Delete";
import IconFolder from "@mui/icons-material/Folder";
import socketService from "../services/socketService";

const PREFIX = "Settings";
const classes = {
  root: `${PREFIX}-root`,
  soonTM: `${PREFIX}-soontm`,
  item: `${PREFIX}-item`,
  buttonIcon: `${PREFIX}-buttonIcon`,
};

export const Root = styled("div")(({ theme }) => ({
  padding: 16,
  background: theme.palette.background.default,
  color: theme.palette.primary.contrastText,
  display: "flex",
  // alignItems: "center",
  flexDirection: "column",
  height: 400,
  [`& .${classes.soonTM}`]: {
    color: "lime",
  },
  [`& .${classes.item}`]: {
    marginBottom: 10,
  },
  [`& .${classes.buttonIcon}`]: {
    marginRight: 10,
  },
}));

const SettingsView = () => {
  useEffect(() => {
    socketService.send({ event: "WINDOW_RESIZE", data: { height: 500 } });
  }, []);

  return (
    <Root>
      <Typography gutterBottom variant="h5" color="textPrimary">
        Settings
      </Typography>
      <div className={classes.item}>
        <Typography gutterBottom variant="body2" color="textPrimary">
          Open your overlayed settings folder
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            let appDir;
            const { platform, home } = window.electron;

            if (platform === "darwin") {
              appDir = `${home}/Library/Application Support/overlayed`;
            } else if (platform === "win32") {              
              appDir = `${home}/AppData/Local/overlayed`;            
            } else if (platform === "linux") {
              appDir = `${home}/.config`;
            }

            window.electron.openDirectory(appDir);
          }}
        >
          <IconFolder classes={{ root: classes.buttonIcon }} color="secondary" /> Open Config
        </Button>
      </div>
      <div className={classes.item}>
        <Typography gutterBottom variant="body2" color="textPrimary">
          Clear your logged into discord account
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            socketService.send({ event: CustomEvents.LOGOUT })
          }}
        >
          <IconTrash classes={{ root: classes.buttonIcon }} color="secondary" /> Logout of Discord
        </Button>
      </div>

      <div style={{ marginTop: "auto", marginLeft: "auto" }}>
        <Button variant="contained" onClick={() => socketService.send({ event: CustomEvents.TOGGLE_DEVTOOLS })}>
          <IconConsole classes={{ root: classes.buttonIcon }} color="secondary" /> Toggle Dev Tools
        </Button>
      </div>
    </Root>
  );
};

export default SettingsView;
