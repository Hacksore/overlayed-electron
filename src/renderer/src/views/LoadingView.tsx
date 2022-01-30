import { CircularProgress, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect } from "react";
import { CustomEvents } from "../../../common/constants";
import socketService from "../services/socketService";

const PREFIX = "LoadingView";
const classes = {
  root: `${PREFIX}-root`,
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
}));

const QUOTES = [
  "Hacking the mainframe",
  "Dividing by zero",
  "Tweeting to papa elon!",
  "Searching stackoverflow",
  "Downloading more dedotated wam",
  "Inspecting element",
];

const LoadingView = () => {
  useEffect(() => {
    socketService.send({ event: CustomEvents.I_AM_READY });
  }, []);

  return (
    <Root>
      <Typography variant="h5" gutterBottom>
        {QUOTES[Math.floor(Math.random() * QUOTES.length)]}
      </Typography>
      <CircularProgress />
    </Root>
  );
};

export default LoadingView;
