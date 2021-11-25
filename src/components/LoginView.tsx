import { Button, Typography } from "@mui/material";
import { styled } from "@mui/system";
import socketService from "../services/socketService";

const PREFIX = "LoginView";
const classes = {
  root: `${PREFIX}-root`,
  instructions: `${PREFIX}-instructions`,
};

export const Root = styled("div")(({ theme }) => ({
  padding: 16,
  background: "#000",
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
        Overlayed needs access tothe Discord client, please click the button below to authenticate at auth.overlayed.dev
      </Typography>

      <Button
        variant="contained"
        onClick={() => {
          socketService.send({
            evt: "LOGIN",
          })
        }}
      >
        Login with Discord
      </Button>
    </Root>
  );
};

export default LoginView;
