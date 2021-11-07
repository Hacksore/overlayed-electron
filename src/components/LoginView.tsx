import { Button, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { CustomEvents } from "../constants/discord";
import socketService from "../services/socketService";
import IconExternal from "@mui/icons-material/Launch";
import { nanoid } from "@reduxjs/toolkit";

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
      textAlign: "center",
      margin: "10px 0 10px 0",
      padding: "10px 12px 10px 12px",
      background: "#1c1c1c",
      borderRadius: 4
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
            Visit Discord Streamkit Overlay <IconExternal />
          </Button>
        </div>
        <div>Click Install for OBS</div>
        <div>Follow the steps to authenticate</div>
      </div>

      <Button
        variant="contained"
        onClick={() => {

          // TODO: just make the main proc do this?
          socketService.send({
            event: "DISCORD_RPC",
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

          // send test
          socketService.send({ event: CustomEvents.REQUEST_CURRENT_CHANNEL });
        }}
      >
        Validate Auth
      </Button>
    </Root>
  );
};

export default LoginView;
