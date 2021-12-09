import React from "react";
import { styled, lighten } from "@mui/material/styles";
import { Box } from "@mui/material";

import { IUser } from "../types/user";
import IconDeafend from "@mui/icons-material/HeadsetOff";
import IconMuted from "@mui/icons-material/MicOff";
import { useScale } from "../hooks/useScale";
import { DiscordAvatar } from "./DiscordAvatar";

import { useAppDispatch } from "../hooks/redux";
import { appSlice } from "../reducers/rootReducer";

const { setContextMenu } = appSlice.actions;
const PREFIX = "UserItem";
const classes = {
  root: `${PREFIX}-root`,
  name: `${PREFIX}-name`,
  icon: `${PREFIX}-icon`,
  avatar: `${PREFIX}-avatar`,
};

interface RootProps {
  scale: number;
  nameColor: string;
}

export const DEFAULT_FONT_SIZE = 15;

const Root = styled("div", {
  shouldForwardProp: prop => !["scale", "nameColor"].includes(prop.toString()),
})<RootProps>(({ nameColor, theme, scale }) => {
  const realScale = 1 + scale * 0.1;

  return {
    alignItems: "center",
    display: "flex",
    margin: "4px 0 4px 0",
    [`& .${classes.name}`]: {
      fontSize: DEFAULT_FONT_SIZE * realScale,
      background: "rgba(40,40,40,1)",
      padding: "6px 10px 6px 10px",
      border: "1px solid #3a3a3a",
      borderRadius: 8,
      display: "flex",
      color: nameColor,
      alignItems: "center",
      margin: "0 0 0 5px",
      "&:hover": {
        background: lighten(theme.palette.background.default, 0.1),
        borderColor: lighten(theme.palette.background.default, 0.2),
        color: `${theme.palette.primary.contrastText} !important`,
      },
    },
    [`& .${classes.icon}`]: {
      marginRight: 2,
      width: DEFAULT_FONT_SIZE * realScale,
      height: DEFAULT_FONT_SIZE * realScale,
    },
  };
});

interface IUserItem extends IUser {
  scale?: number;
}

export const UserItem = React.memo((props: IUserItem) => {
  const { deafened, username, muted, selfDeafened, selfMuted } = props;
  const scale = useScale();
  const dispatch = useAppDispatch();

  const getNameColor = () => {
    if (selfDeafened || muted) {
      return "#515151";
    }

    return "#fff";
  };

  // discord avatar hash can be null so we fix this
  const shouldShowIcons = selfDeafened || selfMuted || muted || deafened;

  return (
    <Root scale={props.scale || scale} nameColor={getNameColor()} className={classes.root}>
      <Box
        sx={{
          position: "relative",
        }}
      >
        <DiscordAvatar scale={props.scale || scale} {...props} />
      </Box>
      <div
        className={classes.name}
        onContextMenu={(event: any) => {
          event.preventDefault();
          dispatch(
            setContextMenu({
              open: true,
              id: props.id,
              x: event.clientX,
              y: event.clientY,
            })
          );
        }}
      >
        <Box
          sx={{
            minWidth: "auto",
            maxWidth: 150,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "flex",
            alignItems: "center",
          }}
        >
          {username}
        </Box>

        {shouldShowIcons && (
          <div style={{ marginLeft: 8, display: "flex", alignSelf: "self-end" }}>
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
