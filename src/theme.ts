import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  spacing: 0,
  palette: {
    background: {
      default: "#3c3c3c",
    },
    error: {
      main: "#f44336"
    },
    primary: {      
      main: "#674097",
      contrastText: "#fff",
    },
    text: {
      primary: "#fff",
    },
    secondary: {
      light: "#fff",
      main: "#fff",
      contrastText: "#000",
    },
  },
});

export { theme };