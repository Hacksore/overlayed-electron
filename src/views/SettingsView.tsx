import { Dialog, Typography, Button, TextField, DialogContent, DialogActions, DialogTitle } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useState } from "react";
import { CustomEvents } from "../constants/discord";
import IconLogout from "@mui/icons-material/Logout";
import IconFolder from "@mui/icons-material/Folder";
import socketService from "../services/socketService";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";

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
  borderBottomLeftRadius: 6,
  borderBottomRightRadius: 6,
  flexDirection: "column",
  height: 400,
  [`& .${classes.soonTM}`]: {
    color: "lime",
  },
  [`& .${classes.item}`]: {
    marginBottom: 16,
  },
  [`& .${classes.buttonIcon}`]: {
    marginRight: 10,
  },
}));

const SettingsView = () => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const isAuthed = useAppSelector((state: RootState) => state.root.isAuthed);

  const navigate = useNavigate();

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
          <IconFolder classes={{ root: classes.buttonIcon }} /> Open Config
        </Button>
      </div>
      <div className={classes.item}>
        <Typography gutterBottom variant="body2" color="textPrimary">
          Disconnect the account you have authorized
        </Typography>
        <Button
          disabled={!isAuthed}
          variant="contained"
          onClick={() => {
            setIsLogoutDialogOpen(true);
          }}
        >
          <IconLogout classes={{ root: classes.buttonIcon }} /> Disconnect Discord Account
        </Button>
      </div>
      <div className={classes.item}>
        <Typography gutterBottom variant="body2" color="textPrimary">
          Clickthrough Hotkey
        </Typography>
        <TextField variant="standard" color="info" focused value="Control+Shift+Space" />
      </div>
      <div className={classes.item}>
        <Typography gutterBottom variant="body2" color="textPrimary">
          Focus Hotkey
        </Typography>
        <TextField variant="standard" color="info" focused value="TBD" />
      </div>

      <div style={{ marginTop: "auto", marginLeft: "auto" }}>
        <Button
          style={{ marginRight: 6 }}
          color="secondary"
          variant="contained"
          onClick={() => {
            !isAuthed ? navigate("/login") : navigate("/list");
          }}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          disabled
          onClick={() => {
            // TODO: save config to file
          }}
        >
          Save
        </Button>
      </div>

      <Dialog open={isLogoutDialogOpen}>
        <DialogTitle>Disconnect Discord Account</DialogTitle>
        <DialogContent>
          <Typography gutterBottom variant="subtitle2" color="textPrimary">
            Are you sure you want to disconnect your Discord account? This will quit Overlayed and you must restart it.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="secondary" onClick={() => setIsLogoutDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={() => socketService.send({ event: CustomEvents.LOGOUT })}>
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
};

export default SettingsView;
