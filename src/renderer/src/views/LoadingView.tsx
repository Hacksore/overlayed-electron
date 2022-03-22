import { Button, CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useState } from "react";
import { CustomEvents } from "../../../common/constants";
import socketService from "../services/socketService";

const PREFIX = "LoadingView";
const classes = {
  error: `${PREFIX}-root`,
};

export const Root = styled("div")(({ theme }) => ({
  padding: 16,
  background: theme.palette.background.default,
  color: theme.palette.primary.contrastText,
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  borderBottomLeftRadius: 6,
  borderBottomRightRadius: 6,
  [`& .${classes.error}`]: {
    margin: `${theme.spacing(1)} 0 ${theme.spacing(1)} 0`,
  },
}));

const QUOTES = [
  "Hacking the mainframe",
  "Dividing by zero",
  "Tweeting to papa elon!",
  "Searching stackoverflow",
  "Downloading more dedotated wam",
  "Inspecting element",
];

const GenericError = () => {
  return (
    <div className={classes.error}>
      <Typography variant="h5">Can't seem to load ☠️</Typography>
      <Typography variant="body2">At this point you should probably raise an issue</Typography>
      <Button component="a" variant="contained" color="secondary" sx={{ mt: 2, mr: 1 }}>
        Login
      </Button>
      <Button
        onClick={() => {
          socketService.send({ event: CustomEvents.CHECK_FOR_DISCORD });
        }}
        component="a"
        color="secondary"
        variant="contained"
        sx={{ mt: 2, mr: 1 }}
      >
        Check for discord
      </Button>
      <Button
        onClick={(e: any) => {
          e.preventDefault();
          window.electron.openInBrowser("https://github.com/Hacksore/overlayed/issues/new");
        }}
        component="a"
        variant="contained"
        sx={{ mt: 2 }}
      >
        Raise issue
      </Button>
    </div>
  );
};

const LoadingView = () => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // emit ready
    socketService.send({ event: CustomEvents.I_AM_READY });

    // wait for at least 15 seconds
    const timerId = setTimeout(() => setFailed(true), 1000 * 15);

    // clear timer on unmount
    return () => clearInterval(timerId);
  }, []);

  return (
    <Root>
      {!failed ? (
        <>
          <Typography variant="h5" gutterBottom>
            {QUOTES[Math.floor(Math.random() * QUOTES.length)]}
          </Typography>
          <CircularProgress />
        </>
      ) : (
        <GenericError />
      )}
    </Root>
  );
};

export default LoadingView;
