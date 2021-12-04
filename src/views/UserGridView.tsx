import { useEffect, useRef } from "react";
import { IUser } from "../types/user";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";
import { Typography, Box } from "@mui/material";
import { styled } from "@mui/system";
import { DiscordAvatar } from "../components/DiscordAvatar";
import settings from "../services/settingsService";

const PREFIX = "UserGridView";
const classes = {
  root: `${PREFIX}-root`,
  user: `${PREFIX}-user`,
  userWrap: `${PREFIX}-userWrap`,
};

const Root = styled("div", { 
  shouldForwardProp: prop => prop !== "scroll"
})<{ scroll: boolean }>(({ scroll }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
  },
  [`& .${classes.userWrap}`]: {
    display: "flex",
    flexWrap: "wrap",
    maxHeight: 500,
    overflowY: scroll ? "none" : "auto",
    paddingTop: 4,
  },
  [`& .${classes.user}`]: {
    padding: "2px 2px 2px 2px"
  },
}));

// TODO: fix this later
const UserGridView = ({ setDivHeight }: { setDivHeight: Function }) => {
  const users = useAppSelector((state: RootState) => state.root.users);
  const clickThrough = useAppSelector((state: RootState) => state.root.clickThrough);
  const listRef = useRef<any>(null);
  const showJoinText = settings.get("showJoinText");

  useEffect(() => {
    const height: number = listRef?.current?.offsetHeight || 0;
    setDivHeight(height);
  }, [listRef?.current?.offsetHeight, setDivHeight]);

  return (
    <Root scroll={clickThrough} ref={listRef} className={classes.root}>
      {(!showJoinText && users.length <= 0) && (
        <Box sx={{ pt: 1, pb: 1 }}>
          <Typography color="textPrimary" variant="h5">
            No Voice Chat 🙉
          </Typography>
          <Typography color="textPrimary" variant="body1">
            Join a voice channel to display users
          </Typography>
        </Box>
      )}

      <div className={classes.userWrap}>
        {users.map((props: IUser) => (
          <div className={classes.user}>
            <DiscordAvatar key={props.id} {...props} />
          </div>
        ))}
      </div>
    </Root>
  );
};

export default UserGridView;
