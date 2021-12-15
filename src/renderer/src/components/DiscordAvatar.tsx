import React, { FC } from "react";
import { styled } from "@mui/material/styles";
import IconDeafend from "@mui/icons-material/HeadsetOff";
import IconMuted from "@mui/icons-material/MicOff";

import { IUser } from "../types/user";
import { useScale } from "../hooks/useScale";
import { useAppDispatch } from "../hooks/redux";
import { appSlice } from "../reducers/rootReducer";
const { setContextMenu } = appSlice.actions;

const PREFIX = "UserItem";
const classes = {
  root: `${PREFIX}-root`,
  avatar: `${PREFIX}-avatar`,
  icons: `${PREFIX}-icons`,
  font: `${PREFIX}-font`,
};

interface RootProps {
  scale: number;
  iconColor: string;
  disabled: boolean;
}

export const DEFAULT_AVATAR_SIZE = 36;

const Root = styled("div", {
  shouldForwardProp: (prop: any) => !["scale", "iconColor"].includes(prop.toString()),
})<RootProps>(({ scale, iconColor }) => {
  const realScale = 1 + scale * 0.1;
  return {
    position: "relative",
    [`& .${classes.avatar}`]: {
      width: DEFAULT_AVATAR_SIZE * realScale,
      height: DEFAULT_AVATAR_SIZE * realScale,
      borderRadius: Math.floor((DEFAULT_AVATAR_SIZE * realScale) / 1),
      border: `3px solid ${iconColor}`,
    },
    [`& .${classes.icons}`]: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      padding: 2,
      background: "rgba(0, 0, 0, 0.6)",
      position: "absolute",
      width: 22,
      height: 22,
      bottom: 0,
      right: 0,
    },
    [`& .${classes.font}`]: {
      fontSize: 20,
      fill: "red"
    },
  };
});

interface IDiscordAvatar extends IUser {
  scale?: number;
  showIcons?: boolean;
}

export const DiscordAvatar: FC<IDiscordAvatar> = React.memo(
  ({ scale: newScale, id, avatarHash, talking, muted, selfDeafened, selfMuted, showIcons }) => {
    const dispatch = useAppDispatch();
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
      <Root
        onContextMenu={(event: any) => {
          event.preventDefault();
          dispatch(
            setContextMenu({
              open: true,
              id: id,
              x: event.clientX,
              y: event.clientY,
            })
          );
        }}
        disabled={selfDeafened}
        iconColor={getIconColor()}
        scale={newScale || scale}
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

        {showIcons && (selfMuted || selfDeafened) && (
          <div className={classes.icons}>
            {selfMuted && !selfDeafened && <IconMuted classes={{ root: classes.font }} />}
            {selfDeafened && <IconDeafend classes={{ root: classes.font }} />}
          </div>
        )}
      </Root>
    );
  }
);
