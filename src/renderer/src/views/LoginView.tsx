import { Button, Typography } from "@mui/material";
import { styled, lighten } from "@mui/system";
import { useEffect } from "react";
import { CustomEvents } from "../../../common/constants";
import socketService from "../services/socketService";

const PREFIX = "LoginView";
const classes = {
  root: `${PREFIX}-root`,
  instructions: `${PREFIX}-instructions`,
  discordIcon: `${PREFIX}-discordIcon`,
  buttonRoot: `${PREFIX}-buttonRoot`,
  item: `${PREFIX}-item`,
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
  [`& .${classes.instructions}`]: {
    ["& div"]: {
      margin: "10px 0 10px 0",
      padding: "10px 12px 10px 12px",
      background: "#1c1c1c",
      borderRadius: 4,
    },
  },
  [`& .${classes.discordIcon}`]: {
    width: 32,
    marginRight: 10,
  },
  [`& .${classes.buttonRoot}`]: {
    alignItems: "center",
    display: "flex",
    marginTop: 24,
    marginBottom: 24,
  },
  [`& .${classes.item}`]: {
    alignItems: "center",
    display: "flex",
    flexGrow: 1,
  },

  ["& a"]: {
    color: lighten(theme.palette.primary.main, 0.35),
  },
}));

const LoginView = () => {
  // TODO: this could be a custom hook as it's use in a few comps
  useEffect(() => {
    // resize
    socketService.send({ event: CustomEvents.WINDOW_RESIZE, data: { height: 350 } });

    // ask electron if we are connected?
    socketService.send({ event: CustomEvents.CHECK_FOR_DISCORD });
  }, []);

  return (
    <Root>
      <Typography gutterBottom variant="h4" color="textPrimary">
        Authorize
      </Typography>
      <Typography variant="body2" color="textPrimary">
        Please sign in with Discord to allow Overlayed to interact with your Discord client. As of now Overlayed will
        only read data from your Discord client.
      </Typography>

      <div className={classes.item}>
        <Button
          variant="contained"
          classes={{ root: classes.buttonRoot }}
          onClick={() => {
            socketService.send({
              evt: CustomEvents.LOGIN,
            });
          }}
        >
          <img className={classes.discordIcon} alt="Discord" src="img/discord-logo-small.svg" />
          Sign In with Discord
        </Button>
      </div>

      <div className={classes.item}>
        <Typography variant="body2" color="textPrimary">
          Click “Sign In” to agree to Overlayed{" "}
          <a
            onClick={e => {
              e.preventDefault();
              window.electron.openInBrowser("https://overlayed.dev/tos");
            }}
            href="https://overlayed.dev/tos"
          >
            Terms of Service
          </a>{" "}
          and acknowledge that Overlayed{" "}
          <a
            onClick={e => {
              e.preventDefault();
              window.electron.openInBrowser("https://overlayed.dev/privacy");
            }}
            href="https://overlayed.dev/privacy"
          >
            Privacy Policy
          </a>{" "}
          applies to you.
        </Typography>
      </div>
    </Root>
  );
};

export default LoginView;
