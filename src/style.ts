import { styled } from "@mui/material/styles";

export const Root = styled("div")(({ theme }) => ({
  padding: "4px 12px 0 12px",
  border: "3px solid rgba(0, 0,0,0)",
  borderStyle: "solid inset solid solid;",
  WebkitAppRegion: "drag",
  fontFamily: "'Roboto', sans-serif",
  userSelect: "none"
}));
