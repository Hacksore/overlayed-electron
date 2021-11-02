import React from "react";
import { styled } from "@mui/material/styles";
import { IUser } from "../types/user";
import IconDeafend from "@mui/icons-material/HeadsetOff";
import IconMuted from "@mui/icons-material/MicOff";
import NitroIcon from "./NitroIcon";

const Root = styled("div")(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  borderRadius: 24,
  margin: "4px 0 4px 0",
}));

const UserItem = React.memo((props: IUser) => {
  const getIconColor = () => {
    if (props.talking) {
      return "#43b581";
    } else if (props.muted) {
      return "#565656";
    } else {
      return "rgba(0,0,0,0)";
    }
  };

  const getNameColor = () => {
    if (props.muted) {
      return "#515151";
    }

    return "#fff";
  };

  return (
    <Root>
      <div style={{ position: "relative" }}>
        {props.premium > 0 && (
          <div
            style={{
              display: "flex",
              padding: 2,
              position: "absolute",
              left: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.6)",
              border: "1px solid #000",
              borderRadius: 15,
            }}
          >
            <NitroIcon color="#f577ff" size="16" />
          </div>
        )}
        <img
          onError={e => {
            // @ts-ignore
            e.target.onerror = null;
            // @ts-ignore
            e.target.src = "/img/default.png";
          }}
          style={{
            border: `3px solid ${getIconColor()}`,
            filter: `${props.muted ? "grayscale(90%)" : "none"}`,
            width: 48,
            height: 48,
            borderRadius: 26,
          }}
          alt="avatar"
          src={`https://cdn.discordapp.com/avatars/${props.id}/${props.avatarHash}.jpg`}
        />
      </div>
      <div
        style={{
          display: "flex",
        }}
      >
        <div
          style={{
            color: getNameColor(),
            fontSize: 22,
            background: "rgba(40,40,40,1)",
            padding: "4px 8px 6px 8px",
            borderRadius: 10,
            display: "flex",
            margin: "0 0 0 5px",
          }}
        >
          <div style={{ marginRight: 6 }}>{props.username}</div>
          {props.deafened && <IconDeafend />}
          {props.muted && <IconMuted />}
        </div>
      </div>
    </Root>
  );
});

export default UserItem;
