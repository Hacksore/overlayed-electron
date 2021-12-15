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
  Checkbox,
  Tooltip,
  Alert,
} from "@mui/material";

import { styled, darken } from "@mui/system";
import { useEffect, useState } from "react";
import { CustomEvents } from "../../../common/constants";
import IconLogout from "@mui/icons-material/Logout";
import IconFolder from "@mui/icons-material/Folder";
import IconDelete from "@mui/icons-material/Delete";
import socketService from "../services/socketService";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";
import { useNavigate } from "react-router-dom";
import { UserItem } from "../components/UserItem";
import settings from "../services/settingsService";
import { useForm, Controller } from "react-hook-form";

const PREFIX = "Settings";
const classes = {
  root: `${PREFIX}-root`,
  soonTM: `${PREFIX}-soontm`,
  item: `${PREFIX}-item`,
  buttonIcon: `${PREFIX}-buttonIcon`,
  radio: `${PREFIX}-radio`,
  container: `${PREFIX}-container`,
  radioItem: `${PREFIX}-radioItem`,
  checkBox: `${PREFIX}-checkBox`,
};

export const Root = styled("div")(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.primary.contrastText,
  display: "flex",
  borderBottomLeftRadius: 6,
  borderBottomRightRadius: 6,
  flexDirection: "column",
  height: 550,
  padding: "16px 0 16px 16px",
  overflowY: "auto",
  [`& .${classes.soonTM}`]: {
    color: "lime",
  },
  [`& .${classes.item}`]: {
    marginBottom: 16,
  },
  [`& .${classes.checkBox}`]: {

  },
  [`& .${classes.buttonIcon}`]: {
    marginRight: 10,
  },
  [`& .${classes.radio}`]: {
    display: "flex",
    flexDirection: "row",
  },
  [`& .${classes.container}`]: {
    height: 460,
    overflowY: "auto",
  },
  [`& .${classes.radioItem}`]: {
    width: 330,
    backgroundColor: darken(theme.palette.background.default, 0.2),
    margin: "2px 0 2px 0",
  },
}));

// TODO: save doesnt acutally save
const SettingsView = () => {
  const newVersion = useAppSelector((state: RootState) => state.root.newVersion);
  const { handleSubmit, control } = useForm();
  const [hotkey] = useState(settings.get("clickthroughHotkey") || "Control+Shift+Space");
  const [scale, setScale] = useState(1);
  const [listStyle, setListStyle] = useState(settings.get("listStyle") || "list");
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const isAuthed = useAppSelector((state: RootState) => state.root.isAuthed);
  const navigate = useNavigate();

  useEffect(() => {
    socketService.send({ event: CustomEvents.WINDOW_RESIZE, data: { height: 584 } });
    setScale(parseInt(settings.get("scale") || 1));
  }, []);

  const onSubmit = (data: any) => {
    for (const [key, val] of Object.entries(data)) {
      // save items to settings
      settings.set(key, val);
    }

    if (listStyle === "grid") {
      settings.set("compactListView", false);
    }

    // go back to previous screen
    navigate(-1);
  };

  return (
    <Root>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={classes.container}>
          {newVersion && (
            <Box sx={{ width: 340, mb: 1, cursor: "pointer" }}>
              <Alert
                onClick={() => {
                  socketService.send({ evt: CustomEvents.APPLY_UPDATE });
                }}
                severity="success"
              >
                Update Available - Click here to apply
              </Alert>
            </Box>
          )}

          <Typography gutterBottom variant="body2" color="textPrimary">
            UI Scale
          </Typography>
          <Box sx={{ alignItems: "center", display: "flex", ml: 2, width: 200 }} className={classes.item}>
            <Controller
              name="scale"
              control={control}
              defaultValue={settings.get("scale") || 1}
              render={({ field: { onChange, value } }) => (
                <Slider
                  aria-label="Scale"
                  min={1}
                  max={8}
                  value={value}
                  onChange={(e: any) => {
                    setScale(e.target.value);
                    onChange(e);
                  }}
                />
              )}
            />

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
            <Controller
              name="listStyle"
              control={control}
              defaultValue={settings.get("listStyle") || "list"}
              render={({ field: { onChange, value } }) => (
                <RadioGroup
                  onChange={(event: any) => {
                    onChange(event);
                    setListStyle(event.target.value);
                  }}
                  value={value}
                  classes={{ root: classes.radio }}
                  aria-label="list style"
                  defaultValue="list"
                  name="list-style"
                >
                  {["List", "Grid"].map(item => (
                    <FormControlLabel
                      key={item}
                      classes={{ root: classes.radioItem }}
                      sx={{
                        backgroundColor: theme =>
                          `${
                            listStyle === item.toLowerCase()
                              ? darken(theme.palette.background.default, 0.3)
                              : darken(theme.palette.background.default, 0.2)
                          } !important`,
                      }}
                      value={item.toLowerCase()}
                      control={<Radio sx={{ color: "text.primary" }} />}
                      label={item}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", ml: 1, width: 240 }} className={classes.checkBox}>
            <Controller
              name="showJoinText"
              control={control}
              defaultValue={settings.get("showJoinText") || false}
              render={({ field: { onChange, value } }) => (
                <FormControlLabel
                  control={
                    <Checkbox checked={value} onChange={onChange} sx={{ color: "text.primary" }} name="showJoinText" />
                  }
                  label="Hide join voice chat text"
                />
              )}
            />
          </Box>

          <Box sx={{ alignItems: "center", display: "flex", ml: 1, width: 240 }} className={classes.checkBox}>
            <Controller
              name="hideTrayIcon"
              control={control}
              defaultValue={settings.get("hideTrayIcon") || false}
              render={({ field: { onChange, value } }) => (
                <Tooltip arrow title="Requires you to restart Overlayed">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={value}
                        onChange={onChange}
                        sx={{ color: "text.primary" }}
                        name="hideTrayIcon"
                      />
                    }
                    label="Hide tray icon"
                  />
                </Tooltip>
              )}
            />
          </Box>

          <Box sx={{ alignItems: "center", display: "flex", ml: 1, width: 240 }} className={classes.item}>
            <Controller
              name="hideTaskbar"
              control={control}
              defaultValue={settings.get("hideTaskbar") || false}
              render={({ field: { onChange, value } }) => (
                <Tooltip arrow title="Not yet implemented">
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled
                        checked={value}
                        onChange={onChange}
                        sx={{ color: "text.primary" }}
                        name="hideTaskbar"
                      />
                    }
                    label="Hide from taskbar/dock"
                  />
                </Tooltip>
              )}
            />
          </Box>

          {/* <Box sx={{ alignItems: "center", display: "flex", ml: 1, mt: -1, width: 240 }} className={classes.item}>
            <Controller
              name="compactListView"
              control={control}
              defaultValue={settings.get("compactListView") || false}
              render={({ field: { onChange, value } }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={listStyle === "grid"}
                      checked={listStyle === "grid" ? false : value}
                      onChange={onChange}
                      sx={{ color: "text.primary" }}
                      name="compactListView"
                    />
                  }
                  label="Compact List View"
                />
              )}
            />
          </Box> */}

          <div className={classes.item}>
            <Typography gutterBottom variant="body2" color="textPrimary">
              Clickthrough Hotkey
            </Typography>

            <Controller
              name="clickthroughHotkey"
              control={control}
              defaultValue={hotkey}
              render={({ field: { onChange, value } }) => (
                <TextField
                  variant="standard"
                  color="info"
                  focused
                  disabled
                  value={value}
                  onKeyDown={(event: any) => {
                    // TODO: This one is hard
                    onChange(event);
                  }}
                />
              )}
            />
          </div>

          <div className={classes.item}>
            <Button
              variant="contained"
              onClick={() => {
                let appDir;
                const { platform, home, appData } = window.electron;

                if (platform === "darwin") {
                  appDir = `${home}/Library/Application Support/overlayed`;
                } else if (platform === "win32") {
                  appDir = `${appData}/overlayed`;
                } else if (platform === "linux") {
                  appDir = `${home}/.config`;
                }

                if (appDir) {
                  window.electron.openDirectory(appDir);
                }
              }}
            >
              <IconFolder classes={{ root: classes.buttonIcon }} /> Open Config
            </Button>
          </div>
          <div className={classes.item}>
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
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                socketService.send({ event: CustomEvents.LOGOUT, data: { relaunch: false } });
              }}
            >
              <IconDelete classes={{ root: classes.buttonIcon }} /> Quit Overlayed
            </Button>
          </div>
        </div>

        <Box sx={{ display: "flex", justifyContent: "flex-end",  height: 60 }}>
          <Box sx={{ display: "flex", flex: 1, alignItems: "center" }}>
            <Typography sx={{ color: theme => darken(theme.palette.primary.contrastText, 0.4) }}>{window.electron.version}</Typography>
          </Box>
          <Box sx={{ display: "flex", pr: 2, alignItems: "center" }}>
            <Button style={{ marginRight: 6 }} color="secondary" variant="contained" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button color="primary" variant="contained" type="submit">
              Save
            </Button>
          </Box>
        </Box>
      </form>

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
          <Button
            variant="contained"
            color="error"
            onClick={() => socketService.send({ event: CustomEvents.LOGOUT, data: { clearAuth: true } })}
          >
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
};

export default SettingsView;
