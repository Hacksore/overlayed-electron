import React from "react";
import { styled } from "@mui/material/styles";
import { IUser } from "../types/user";
import IconDeafend from "@mui/icons-material/HeadsetOff";
import IconMuted from "@mui/icons-material/MicOff";
import IconTroll from "@mui/icons-material/Dangerous";

// TODO: rename for consistancy
import IconNitro from "./IconNitro";

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
    if (props.selfDeafened) {
      return "#515151";
    } else if (props.deafened) {
      return "green";
    }

    return "#fff";
  };

  // discord avatar hash can be null so we fix this
  const avatarUrl = props.avatarHash
    ? `https://cdn.discordapp.com/avatars/${props.id}/${props.avatarHash}.jpg`
    : "/img/default.png";

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
            <IconNitro color="#f577ff" size="16" />
          </div>
        )}

        {/* // TODO: FIX */}
        {false && (
          <div
            style={{
              padding: 2,
              position: "absolute",
              left: 0,
              top: 0,
            }}
          >
            <IconTroll style={{ color: "red", fontSize: 48 }} />
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
            filter: `${props.selfDeafened ? "grayscale(90%)" : "none"}`,
            width: 48,
            height: 48,
            borderRadius: 26,
          }}
          alt="avatar"
          src={avatarUrl}
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
            padding: "4px 8px 4px 8px",
            border: "1px solid #3a3a3a",
            alignItems: "center",
            borderRadius: 10,
            display: "flex",
            margin: "0 0 0 5px",
          }}
        >
          <div title={JSON.stringify(props)}>{props.username}</div>
          {(props.selfDeafened || props.selfMuted) && (
            <div style={{ marginLeft: 6 }}>
              {props.selfDeafened && <IconDeafend />}
              {props.selfMuted && <IconMuted />}
            </div>
          )}
        </div>
      </div>
    </Root>
  );
});

export default UserItem;
