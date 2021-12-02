import {
  Dialog,
  Slider,
  Typography,
  Button,
  TextField,
  DialogContent,
  DialogActions,
  DialogTitle,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useState } from "react";
import { CustomEvents } from "../constants/discord";
import IconLogout from "@mui/icons-material/Logout";
import IconFolder from "@mui/icons-material/Folder";
import socketService from "../services/socketService";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";
import { useNavigate } from "react-router-dom";

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
  const [scale, setScale] = useState(1);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const isAuthed = useAppSelector((state: RootState) => state.root.isAuthed);
  const navigate = useNavigate();

  useEffect(() => {
    socketService.send({ event: "WINDOW_RESIZE", data: { height: 480 } });

    const localScale = localStorage.getItem("scale") || "";
    setScale(parseInt(localScale));
  }, []);

  useEffect(() => {
    localStorage.setItem("scale", scale.toString());
  }, [scale]);

  const handleSlider = (event: any) => {
    setScale(event.target.value);
  };

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

      <Typography gutterBottom variant="body2" color="textPrimary">
        UI Scale
      </Typography>
      <Box sx={{ alignItems: "center", display: "flex", ml: 1, width: 200 }} className={classes.item}>
        <Slider aria-label="Scale" min={1} max={8} value={scale} onChange={handleSlider} />
        <Box sx={{ ml: 2 }}>{scale}</Box>
      </Box>

      <div className={classes.item}>
        <Typography gutterBottom variant="body2" color="textPrimary">
          Clickthrough Hotkey
        </Typography>
        <TextField variant="standard" color="info" focused value="Control+Shift+Space" />
      </div>

      <div style={{ marginTop: "auto", marginLeft: "auto" }}>
        <Button
          style={{ marginRight: 6 }}
          color="secondary"
          variant="contained"
          onClick={() => {
            navigate(-1);
          }}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            // TODO: save config to file

            navigate(-1);
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
