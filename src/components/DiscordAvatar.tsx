import React, { useRef } from "react";
import { styled } from "@mui/material/styles";

import { IUser } from "../types/user";
import { useScale } from "../hooks/useScale";
import { useAppDispatch } from "../hooks/redux";
import { appSlice } from "../reducers/rootReducer";
const { setContextMenu } = appSlice.actions;

const PREFIX = "UserItem";
const classes = {
  root: `${PREFIX}-root`,
  avatar: `${PREFIX}-avatar`,
};

interface RootProps {
  scale: number;
  iconColor: string;
  disabled: boolean;
}

export const DEFAULT_AVATAR_SIZE = 36;

const Root = styled("div", {
  shouldForwardProp: (prop: any) => !["scale", "iconColor", "disabled"].includes(prop.toString()),
})<RootProps>(({ scale, iconColor, disabled }) => {
  const realScale = 1 + scale * 0.1;
  return {
    position: "relative",
    filter: `${disabled ? "grayscale(90%)" : "none"}`,
    [`& .${classes.avatar}`]: {
      width: DEFAULT_AVATAR_SIZE * realScale,
      height: DEFAULT_AVATAR_SIZE * realScale,
      borderRadius: Math.floor((DEFAULT_AVATAR_SIZE * realScale) / 1),
      border: `3px solid ${iconColor}`,
    },
  };
});

interface IDiscordAvatar extends IUser {
  scale?: number;
}

export const DiscordAvatar = React.memo((props: IDiscordAvatar) => {
  const dispatch = useAppDispatch();
  const { id, avatarHash, talking, muted, selfDeafened } = props;
  const scale = useScale();
  const ref = useRef(null);

  const getIconColor = () => {
    if (talking) {
      return "#43b581";
    } else if (muted) {
      return "#565656";
    } else {
      return "rgba(0,0,0,0)";
    }
  };

  // discord avatar hash can be null so we fix this
  const avatarUrl = avatarHash ? `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.jpg` : "./img/default.png";

  return (
    <Root
      ref={ref}
      onContextMenu={(event: any) => {
        event.preventDefault();
        dispatch(setContextMenu({ 
          open: true, 
          id: props.id, 
          x: event.clientX, 
          y: event.clientY 
        }));
      }}
      disabled={selfDeafened}
      iconColor={getIconColor()}
      scale={props.scale || scale}
    >
      <img
        onError={e => {
          // @ts-ignore
          e.target.onerror = null;
          // @ts-ignore
          e.target.src = "./img/default.png";
        }}
        className={classes.avatar}
        alt="avatar"
        src={avatarUrl}
      />
    </Root>
  );
});
