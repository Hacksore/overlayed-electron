import { styled } from '@mui/material/styles';

export const Root = styled("div")(({ theme }) => ({
  border: "2px solid #353535",
  padding: 12,
  height: "calc(100vh - 45px)",
  WebkitAppRegion: "drag",
  fontFamily: "'Roboto', sans-serif"
}));