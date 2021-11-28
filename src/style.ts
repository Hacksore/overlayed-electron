import { styled } from "@mui/material/styles";

export const Root = styled("div")(({ theme }) => ({
  height: "100%",
  // border: "4px solid rgba(0, 0, 0, 0)",
  fontFamily: "'Roboto', sans-serif",
  userSelect: "none",
  borderRadius: 10,
  appRegion: "no-drag",
  // "&:hover": {
  //   borderColor: "#60d67d",
  //   background: darken(theme.palette.secondary.main, 0.6)
  // }
}));
