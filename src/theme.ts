import { darken, createTheme } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    background: {
      default: "#2C2F33",
      paper: "#2C2F33",
    },
    error: {
      main: "#db5151",
    },
    primary: {
      main: "#5A65EA",
      contrastText: "#fff",
    },
    text: {
      primary: "#fff",
      disabled: "#c9c9c9",
    },
    secondary: {
      main: "#747474",
      contrastText: "#fff",
    },
    action: {
      disabled: "rgb(150, 150, 150)",
      disabledBackground: darken("#5A65EA", 0.2),
    },
  },
});

// overrides with access to the theme here  
theme = createTheme(theme, {
  components: {
    MuiTooltip: {
      styleOverrides: {
        arrow: {
          color: theme.palette.background.default,
          "&::before": {
            // apply to the border of the arrow
            border: `1px solid #3a3a3a`,
            backgroundColor: darken(theme.palette.background.default, 0.2),
            boxSizing: "border-box",
          },
        },
        tooltip: {
          backgroundColor: darken(theme.palette.background.default, 0.2),
          border: `1px solid #3a3a3a`,
          fontSize: 20,
        },
      },
    },

  }, 
});

export { theme };
