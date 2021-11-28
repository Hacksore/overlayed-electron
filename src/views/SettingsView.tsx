import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect } from "react";
import socketSerivce from "../services/socketService";

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
  height: "100vh",
  [`& .${classes.soonTM}`]: {
    color: "lime",
  }
}));

const SettingsView = () => {
  useEffect(() => {
    socketSerivce.send({ evt: "WINDOW_RESIZE", data: { height:  400 } });
  }, []);

  return (
    <Root>
      <Typography gutterBottom variant="h5" color="textPrimary">
        Settings
      </Typography>

      <p className={classes.soonTM}>Coming soonTM</p>
     
    </Root>
  );
};

export default SettingsView;
