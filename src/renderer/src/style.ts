import { styled } from "@mui/material/styles";

export const Root = styled("div")(({ theme }) => ({
  height: "100%",
  fontFamily: "'Roboto', sans-serif",
  userSelect: "none",
  borderRadius: 10,
  appRegion: "no-drag",
}));
