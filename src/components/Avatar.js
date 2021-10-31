const Avatar = ({ nick, userId, isTalking, avatarHash }) => {
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
          e.target.onerror = null;
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
};

export default Avatar;
