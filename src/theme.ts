import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {

  },
  spacing: 0,
  palette: {
    background: {
      default: "#2C2F33",
    },
    error: {
      main: "#f44336"
    },
    primary: {      
      main: "#5A65EA",
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