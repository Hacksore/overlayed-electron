import { Button, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { nanoid } from "@reduxjs/toolkit";
import socketService from "../services/socketService";

const PREFIX = "LoginView";
const classes = {
  root: `${PREFIX}-root`,
  instructions: `${PREFIX}-instructions`,
};

export const Root = styled("div")(({ theme }) => ({
  padding: 16,
  background: "rgba(0,0,0,0.5)",
  color: theme.palette.primary.contrastText,
  height: "100vh",
  display: "flex",
  flexDirection: "column",

  [`& .${classes.instructions}`]: {
    [`& div`]: {
      margin: "10px 0 10px 0",
      padding: "10px 12px 10px 12px",
      background: "#000",
      border: "2px solid #2b2b2b",
      borderRadius: 8
    },
  },
}));

const LoginView = () => {
  return (
    <Root>
      <Typography gutterBottom variant="h4" color="textPrimary">
        Login Required
      </Typography>
      <Typography variant="subtitle1" color="textPrimary">
        You need to authenticate with discord streamkit in order to get connected
      </Typography>

      <div className={classes.instructions}>
        <div>
          <Button
            variant="contained"
            onClick={() => {
              window.electron.openInBrowser("https://streamkit.discord.com/overlay");
            }}
          >
            Visit Discord Streamkit Overlay
          </Button>
        </div>
        <div>Click Install for OBS</div>
        <div>Follow the steps to authenticate</div>
      </div>

      <Button
        variant="contained"
        onClick={() =>
          socketService.send({
            event: "AUTH",
            data: {
              cmd: "AUTHORIZE",
              nonce: nanoid(),
              args: {
                client_id: "207646673902501888",
                scopes: ["rpc", "messages.read"],
                prompt: "none",
              },
            },
          })
        }
      >
        Validate Auth
      </Button>
    </Root>
  );
};

export default LoginView;
