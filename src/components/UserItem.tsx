import React from "react";
import { styled, lighten } from "@mui/material/styles";
import { Box } from "@mui/material";

import { IUser } from "../types/user";
import IconDeafend from "@mui/icons-material/HeadsetOff";
import IconMuted from "@mui/icons-material/MicOff";
import { useScale } from "../hooks/useScale";
import { DiscordAvatar } from "./DiscordAvatar";

const PREFIX = "UserItem";
const classes = {
  root: `${PREFIX}-root`,
  name: `${PREFIX}-name`,
  icon: `${PREFIX}-icon`,
  avatar: `${PREFIX}-avatar`,
};

interface RootProps {
  scale: number;
}

export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_AVATAR_SIZE = 38;

const Root = styled("div", {
  shouldForwardProp: prop => prop !== "scale",
})<RootProps>(({ theme, scale }) => {
  const realScale = scale * 0.4;

  return {
    alignItems: "center",
    display: "flex",
    margin: "4px 0 4px 0",
    [`& .${classes.avatar}`]: {
      width: DEFAULT_AVATAR_SIZE * realScale,
      height: DEFAULT_AVATAR_SIZE * realScale,
      borderRadius: Math.floor((DEFAULT_AVATAR_SIZE * realScale) / 1),
    },
    [`& .${classes.name}`]: {
      fontSize: DEFAULT_FONT_SIZE * realScale,
      background: "rgba(40,40,40,1)",
      padding: "6px 10px 6px 10px",
      border: "1px solid #3a3a3a",
      borderRadius: 8,
      display: "flex",
      alignItems: "flex-start",
      margin: "0 0 0 5px",
      "&:hover": {
        background: lighten(theme.palette.background.default, 0.1),
        borderColor: lighten(theme.palette.background.default, 0.2),
        color: `${theme.palette.primary.contrastText} !important`
      }
    },
    [`& .${classes.icon}`]: {
      width: DEFAULT_FONT_SIZE * realScale,
      height: DEFAULT_FONT_SIZE * realScale,
    },
  };
});

export const UserItem = React.memo((props: IUser) => {
  const { deafened, username, muted, selfDeafened, selfMuted } = props;
  const scale = useScale();

  const getNameColor = () => {
    if (selfDeafened || muted) {
      return "#515151";
    }

    return "#fff";
  };

  // discord avatar hash can be null so we fix this
  const shouldShowIcons = selfDeafened || selfMuted || muted || deafened;

  return (
    <Root scale={scale} className={classes.root}>
      <DiscordAvatar {...props} />
      <div
        className={classes.name}
        style={{
          color: getNameColor(),
        }}
      >
        <Box
          sx={{
            minWidth: "auto",
            maxWidth: 150,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",      
          }}
        >
          {username}
        </Box>

        {shouldShowIcons && (
          <div style={{ marginLeft: 10, display: "flex", alignSelf: "self-end" }}>
            {(selfDeafened || deafened) && (
              <IconDeafend classes={{ root: classes.icon }} style={{ color: muted || deafened ? "red" : "inherit" }} />
            )}
            {(selfMuted || muted) && (
              <IconMuted classes={{ root: classes.icon }} style={{ color: muted || deafened ? "red" : "inherit" }} />
            )}
          </div>
        )}
      </div>
    </Root>
  );
});
