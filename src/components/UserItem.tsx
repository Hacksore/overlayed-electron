import React from "react";

interface IUserItemProps {
  nick: string;
  userId: string;
  isTalking: boolean;
  avatarHash: string;
}

const UserItem = React.memo(({ nick, userId, isTalking, avatarHash }: IUserItemProps) => {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        borderRadius: 24,
        margin: "4px 0 4px 0",
      }}
    >
      <img
        onError={(e) => {
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
          fontSize: isTalking ? 24 : 20,
          background: "rgba(0,0,0,0.2)",
          padding: "4px 8px 8px 8px",
          borderRadius: 10,
          margin: 0,
        }}
      >
        {nick}
      </p>
    </div>
  );
});

export default UserItem;
