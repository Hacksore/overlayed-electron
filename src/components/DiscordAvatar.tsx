import React from "react";
import { styled } from "@mui/material/styles";

import { IUser } from "../types/user";
import { useScale } from "../hooks/useScale";

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

export const DEFAULT_FONT_SIZE = 16;
export const DEFAULT_AVATAR_SIZE = 38;

const Root = styled("div", {
  shouldForwardProp: prop => !["scale", "iconColor", "disabled"].includes(prop.toString())
})<RootProps>(({ scale, iconColor, disabled }) => {
  const realScale = scale * 0.4;
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

export const DiscordAvatar = React.memo((props: IUser) => {
  const { id, avatarHash, talking, muted, selfDeafened } = props;
  const scale = useScale();

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
    <Root disabled={selfDeafened} iconColor={getIconColor()} scale={scale}>
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
