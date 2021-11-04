import { Button, Typography } from "@mui/material";
import { styled } from "@mui/system";

export const Root = styled("div")(({ theme }) => ({
  padding: "4px 12px 0 12px",
  background: "rgba(0,0,0,0.3)",
  color: theme.palette.primary.contrastText,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
}));

const FirstTimeExperience = () => {
  return (
    <Root>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h4">Overlayed</Typography>
        <Typography variant="body2">Authenticate with discord to get started</Typography>
        <Button variant="contained">Auth with discord</Button>
      </div>

    </Root>
  );
};

export default FirstTimeExperience;
