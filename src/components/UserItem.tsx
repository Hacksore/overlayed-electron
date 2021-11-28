import React from "react";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

import { IUser } from "../types/user";
import IconDeafend from "@mui/icons-material/HeadsetOff";
import IconMuted from "@mui/icons-material/MicOff";

const PREFIX = "UserItem";
const classes = {
  root: `${PREFIX}-root`,
  name: `${PREFIX}-name`,
  avatar: `${PREFIX}-avatar`,
};

const Root = styled("div")(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  borderRadius: 24,
  margin: "4px 0 4px 0",
  [`& .${classes.avatar}`]: {
    width: 48,
    height: 48,
    borderRadius: 26,
  },
  [`& .${classes.name}`]: {
    fontSize: 22,
    background: "rgba(40,40,40,1)",
    padding: "6px 10px 6px 10px",
    border: "1px solid #3a3a3a",
    borderRadius: 10,
    display: "flex",
    alignItems: "flex-start",
    margin: "0 0 0 5px",
  }
}));

const RichToolTip = (props: IUser) => {
  const { username, discriminator } = props;
  return (
    <>
      {username}#{discriminator}
    </>
  );
};

const UserItem = React.memo((props: IUser) => {
  const { id, deafened, username, avatarHash, talking, muted, selfDeafened, selfMuted } = props;

  const getIconColor = () => {
    if (talking) {
      return "#43b581";
    } else if (muted) {
      return "#565656";
    } else {
      return "rgba(0,0,0,0)";
    }
  };

  const getNameColor = () => {
    if (selfDeafened || muted) {
      return "#515151";
    }

    return "#fff";
  };

  // discord avatar hash can be null so we fix this
  const avatarUrl = avatarHash ? `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.jpg` : "./img/default.png";
  const shouldShowIcons = selfDeafened || selfMuted || muted || deafened;

  return (
    <Root className={classes.root}>
      <div style={{ position: "relative" }}>
        <img
          onError={e => {
            // @ts-ignore
            e.target.onerror = null;
            // @ts-ignore
            e.target.src = "./img/default.png";
          }}
          className={classes.avatar}
          // TODO: how to pass props
          style={{
            border: `3px solid ${getIconColor()}`,
            filter: `${selfDeafened ? "grayscale(90%)" : "none"}`,
          }}
          alt="avatar"
          src={avatarUrl}
        />
      </div>

      <div
        className={classes.name}
        style={{
          color: getNameColor(),
        }}
      >
        <Tooltip arrow title={<RichToolTip {...props} />}>
          <div
            style={{
              minWidth: "auto",
              maxWidth: 150,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {username}
          </div>
        </Tooltip>

        {shouldShowIcons && (
          <div style={{ marginLeft: 10, display: "flex", alignSelf: "self-end" }}>
            {(selfDeafened || deafened) && <IconDeafend style={{ color: muted || deafened ? "red" : "inherit" }} />}
            {(selfMuted || muted) && <IconMuted style={{ color: muted || deafened ? "red" : "inherit" }} />}
          </div>
        )}
      </div>
    </Root>
  );
});

export default UserItem;
