import { Global } from "@emotion/react";
import { css } from "@mui/styled-engine";
import { darken } from "@mui/material/styles";
import { useTheme } from "@mui/system";

export const GlobalStyleOverride = () => {
  const theme = useTheme();
  return (
    <Global
      styles={css({
        div: {
          "::-webkit-scrollbar": {
            width: 10,
          },
          "::-webkit-scrollbar-track": {
            borderRadius: 10,
            background: "#000",
          },
          "::-webkit-scrollbar-thumb": {
            background: darken(theme.palette.secondary.main, 0.1),
            borderRadius: 10,
          },
          "::-webkit-scrollbar-thumb:hover": {
            background: darken(theme.palette.secondary.main, 0.4),
          },
        },
      })}
    />
  );
};
