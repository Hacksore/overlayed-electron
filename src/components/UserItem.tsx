import React from "react";
import { styled } from "@mui/material/styles";

interface IUserItemProps {
  nick: string;
  userId: string;
  isTalking: boolean;
  avatarHash: string;
}

const Root = styled("div")(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  borderRadius: 24,
  margin: "4px 0 4px 0",
}));

const UserItem = React.memo(({ nick, userId, isTalking, avatarHash }: IUserItemProps) => {
  return (
    <Root>
      <img
        onError={e => {
          // @ts-ignore
          e.target.onerror = null;
          // @ts-ignore
          e.target.src = "/img/default.png";
        }}
        style={{
          border: `3px solid ${isTalking ? "#43b581" : "rgba(0,0,0,0)"}`,
          width: 48,
          height: 48,
          borderRadius: 26,
        }}
        alt="avatar"
        src={`https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.jpg`}
      />
      <p
        style={{
          color: isTalking ? "#fff" : "#c1c1c1",
          fontSize: 22,
          // TODO: alpha here makes it hard to see on light backgrounds
          // using solid color for now
          background: "rgba(40,40,40,1)",
          padding: "4px 8px 6px 8px",
          borderRadius: 10,
          margin: "0 0 0 5px",
        }}
      >
        {nick}
      </p>
    </Root>
  );
});

export default UserItem;
