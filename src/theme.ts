import { createTheme } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    background: {
      default: "#2C2F33",
    },
    error: {
      main: "#f44336",
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

// overrides with access to the theme here  
theme = createTheme(theme, {
  spacing: 0,
  components: {
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          color: theme.palette.background.default,
          "&::before": {
            // apply to the border of the arrow
            border: `1px solid #3a3a3a`,
            backgroundColor: theme.palette.background.default,
            boxSizing: "border-box",
          },
        },
        tooltip: {
          backgroundColor: theme.palette.background.default,
          border: `1px solid #3a3a3a`,
          fontSize: 20,
        },
      },
    }
  }, 
});

export { theme };
