import { styled } from "@mui/material/styles";

export const Root = styled("div")(({ theme }) => ({
  padding: 12,
  border: "3px solid rgba(0, 0,0,0)",
  borderStyle: "solid inset solid solid;",
  // height: "calc(100vh - 45px)",
  WebkitAppRegion: "drag",
  fontFamily: "'Roboto', sans-serif",
  userSelect: "none",
  "&:hover": {
    borderColor: "rgba(0, 0, 0, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.2)"
  }
}));
