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
  FormControlLabel,
  RadioGroup,
  Radio,
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
import { UserItem } from "../components/UserItem";

const PREFIX = "Settings";
const classes = {
  root: `${PREFIX}-root`,
  soonTM: `${PREFIX}-soontm`,
  item: `${PREFIX}-item`,
  buttonIcon: `${PREFIX}-buttonIcon`,
  radio: `${PREFIX}-radio`,
  container: `${PREFIX}-container`,
};

export const Root = styled("div")(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.primary.contrastText,
  display: "flex",
  borderBottomLeftRadius: 6,
  borderBottomRightRadius: 6,
  flexDirection: "column",
  height: 550,
  padding: "16px 0 100px 16px",
  overflowY: "auto",
  [`& .${classes.soonTM}`]: {
    color: "lime",
  },
  [`& .${classes.item}`]: {
    marginBottom: 16,
  },
  [`& .${classes.buttonIcon}`]: {
    marginRight: 10,
  },
  [`& .${classes.radio}`]: {
    display: "flex",
    flexDirection: "row",
  },
  [`& .${classes.container}`]: {
    height: 450,
    overflowY: "auto",
  },
}));

// TODO: save doesnt acutally save
const SettingsView = () => {
  const [scale, setScale] = useState(1);
  const [keys, setKeys] = useState("");
  const [listStyle, setListStyle] = useState(localStorage.getItem("listStyle") || "list");

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const isAuthed = useAppSelector((state: RootState) => state.root.isAuthed);
  const navigate = useNavigate();

  useEffect(() => {
    socketService.send({ event: "WINDOW_RESIZE", data: { height: 620 } });

    const localScale = localStorage.getItem("scale") || "";
    setScale(parseInt(localScale));
  }, []);

  useEffect(() => {
    localStorage.setItem("scale", scale.toString());
  }, [scale]);

  const handleSlider = (event: any) => {
    setScale(event.target.value);
  };

  const handleListChange = (event: any) => {
    const listType = event.target.value;
    setListStyle(listType);
    localStorage.setItem("listStyle", listType);
  };

  // TODO: make a nice selector
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { key } = event;

    const keyToAdd = keys.length > 0 ? keys + "+" : "";
    if (event.metaKey || event.shiftKey) {
      setKeys(keyToAdd + event.key);
    } else {
      setKeys(event.key);
    }

    if (key === "Enter") {
      setKeys("");
    }
  };

  return (
    <Root>
      <Typography gutterBottom variant="h5" color="textPrimary">
        Settings
      </Typography>

      <div className={classes.container}>
        <Typography gutterBottom variant="body2" color="textPrimary">
          UI Scale
        </Typography>
        <Box sx={{ alignItems: "center", display: "flex", ml: 1, width: 200 }} className={classes.item}>
          <Slider aria-label="Scale" min={1} max={6} value={scale} onChange={handleSlider} />
          <Box sx={{ ml: 2 }}>{scale}</Box>
        </Box>
        <Box sx={{ alignItems: "center", display: "flex", ml: 1, width: 200 }} className={classes.item}>
          <UserItem
            scale={scale}
            username="PoggerChamp"
            avatarHash="123"
            id="123"
            talking={false}
            deafened={false}
            muted={false}
            selfDeafened={false}
            selfMuted={false}
            suppress={false}
            volume={100}
            bot={false}
            premium={0}
            flags={0}
            discriminator="0000"
            lastUpdate={123}
          />
        </Box>

        <Typography gutterBottom variant="body2" color="textPrimary">
          User List style
        </Typography>
        <Box sx={{ alignItems: "center", display: "flex", ml: 1, width: 200 }} className={classes.item}>
          <RadioGroup
            onChange={handleListChange}
            value={listStyle}
            classes={{ root: classes.radio }}
            aria-label="list style"
            defaultValue="list"
            name="list-style"
          >
            <FormControlLabel value="list" control={<Radio sx={{ color: "text.primary" }} />} label="List" />
            <FormControlLabel value="grid" control={<Radio sx={{ color: "text.primary" }} />} label="Grid" />
          </RadioGroup>
        </Box>

        {/* TODO: WIP  */}
        <div className={classes.item}>
          <Typography gutterBottom variant="body2" color="textPrimary">
            Clickthrough Hotkey
          </Typography>
          <TextField variant="standard" color="info" focused value={keys} onKeyDown={handleKeyDown} />
        </div>
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
      </div>

      <Box sx={{ position: "absolute", bottom: 10, right: 20, marginLeft: "auto" }}>
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
      </Box>

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
