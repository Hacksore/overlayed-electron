import { styled } from "@mui/material/styles";

export const Root = styled("div")(({ theme }) => ({
  height: "100%",
  boxSizing: "border-box",
  fontFamily: "'Roboto', sans-serif",
  borderRadius: 8,
  userSelect: "none",
}));
