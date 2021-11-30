import { Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import { useEffect } from "react";
import socketService from "../services/socketService";

export const Root = styled("div")(({ theme }) => ({
  padding: 16,
  background: theme.palette.background.default,
  color: theme.palette.primary.contrastText,
  borderBottomLeftRadius: 6,
  borderBottomRightRadius: 6,
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  height: 400,
}));

const ConnectionFailedView = () => {
  useEffect(() => {
    socketService.send({ event: "WINDOW_RESIZE", data: { height: 300 } });
  }, []);

  return (
    <Root>
      <Typography gutterBottom variant="h4" color="textPrimary">
        Failed to Connect
      </Typography>
      <Typography sx={{ mb: 2 }} variant="body2" color="textPrimary">
        We can't connect to the Discord client, please make sure have it open and try again.
      </Typography>

      <Typography sx={{ mb: 2 }} variant="body2" color="textPrimary">
        If the issue persists, please raise an issue on the GitHub repository.
      </Typography>

      <Button
        variant="contained"
        onClick={() => {
          // TODO: add to enums
          socketService.send({ event: "CHECK_FOR_DISCORD" });
        }}
      >
        Check for discord
      </Button>
    </Root>
  );
};

export default ConnectionFailedView;
