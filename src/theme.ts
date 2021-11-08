import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  components: {

  },
  spacing: 0,
  palette: {
    background: {
      default: "rgba(40,40,40,1)",
    },
    error: {
      main: "#f44336"
    },
    primary: {      
      main: "#495bfc",
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