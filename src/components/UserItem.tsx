import React from "react";
import { styled } from "@mui/material/styles";
import { TooltipProps } from "@mui/material";

///               V wat.jpg
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import { IUser } from "../types/user";
import IconDeafend from "@mui/icons-material/HeadsetOff";
import IconMuted from "@mui/icons-material/MicOff";
import IconNitro from "./IconNitro";

const PREFIX = "UserItem";
const classes = {
  root: `${PREFIX}-root`,
  iconNitro: `${PREFIX}-iconNitro`,
};

const Root = styled("div")(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  borderRadius: 24,
  margin: "4px 0 4px 0",
  [`& .${classes.iconNitro}`]: {
    display: "flex",
    padding: 2,
    position: "absolute",
    left: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    border: "1px solid #000",
    borderRadius: 15,
  },
}));

// note to self, this probably belongs on a cringe list somewhere
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.default,
    "&::before": {
      // apply to the border of the arrow
      border: `1px solid #3a3a3a`,
      backgroundColor: theme.palette.background.default,
      boxSizing: "border-box"
    }
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.default,
    border: `1px solid #3a3a3a`,
    fontSize: 20,
  },
}));

const RichToolTip = (props: IUser) => {
  const { username, discriminator } = props;
  return (
    <div>      
      {username}#{discriminator}
    </div>
  );
};

const UserItem = React.memo((props: IUser) => {
  const { id, username, avatarHash, talking, muted, selfDeafened, selfMuted, premium } = props;

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

  return (
    <Root className={classes.root}>
      <div style={{ position: "relative" }}>
        {premium > 0 && (
          <div className={classes.iconNitro}>
            <IconNitro color="#f577ff" size="16" />
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
            filter: `${selfDeafened ? "grayscale(90%)" : "none"}`,
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
            padding: "6px 10px 6px 10px",
            border: "1px solid #3a3a3a",
            borderRadius: 10,
            display: "flex",
            alignItems: "flex-start",
            margin: "0 0 0 5px",
          }}
        >
          <StyledTooltip arrow title={<RichToolTip {...props} />}>
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
          </StyledTooltip>
          {(selfDeafened || selfMuted || muted) && (
            <div style={{ marginLeft: 10, display: "flex", alignSelf: "self-end" }}>
              {(selfDeafened || muted) && <IconDeafend style={{ color: muted ? "red" : "inherit" }} />}
              {selfMuted && <IconMuted />}
            </div>
          )}
        </div>
      </div>
    </Root>
  );
});

export default UserItem;
