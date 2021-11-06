import { Button, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { nanoid } from "@reduxjs/toolkit";

// const PREFIX = "LoginView";
// const classes = {
//   root: `${PREFIX}-root`,
// };

export const Root = styled("div")(({ theme }) => ({
  padding: "4px 12px 0 12px",
  background: "#383838",
  color: theme.palette.primary.contrastText,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
}));

const LoginView = () => {
  return (
    <Root>
      <Typography variant="h5" color="textPrimary">
        Authentication Required
      </Typography>
      <Typography variant="body2" color="textPrimary">
        Since the RPC is not available to all developers at this time you;ll need to authenticate with streamkit.
      </Typography>

      <ol>
        <li>
          Visit <a href="https://streamkit.discord.com/overlay">https://streamkit.discord.com/overlay</a>
        </li>
        <li>Click install for OBS</li>
        <li>Follow the steps to authenticate</li>
      </ol>

      <Button
        variant="contained"
        onClick={() => {
          window.electron.send("toMain", {
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
          });
        }}
      >
        Validate Auth
      </Button>
    </Root>
  );
};

export default LoginView;
