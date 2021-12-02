import { useEffect, useRef } from "react";
import { UserItem } from "../components/UserItem";
import { IUser } from "../types/user";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";
import { Typography, Box } from "@mui/material";
import { styled, darken } from "@mui/system";

const PREFIX = "UserGridView";
const classes = {
  root: `${PREFIX}-root`,
  item: `${PREFIX}-item`,
  avatar: `${PREFIX}-avatar`,
};

// TODO: this is repeated
const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
  },
  [`&.${classes.item}`]: {},
  [`& .${classes.avatar}`]: {
    width: 32,
    height: 32,
    borderRadius: 18,
  },
}));

const UserGridView = ({ setDivHeight }: { setDivHeight: Function }) => {
  const users = useAppSelector((state: RootState) => state.root.users);
  const listRef = useRef<any>(null);

  useEffect(() => {
    const height: number = listRef?.current?.offsetHeight || 0;
    setDivHeight(height);
  }, [listRef?.current?.offsetHeight, setDivHeight]);

  return (
    <Root ref={listRef} className={classes.root}>
      {users.length <= 0 && (
        <Box sx={{ pt: 1, pb: 1 }}>
          <Typography color="textPrimary" variant="h5">
            No Voice Chat 🙉
          </Typography>
          <Typography color="textPrimary" variant="body1">
            Join a voice channel to display users
          </Typography>
        </Box>
      )}

      <div className={classes.item}>
        {users.map((item: IUser) => {
          const { id, avatarHash } = item;

          const avatarUrl = avatarHash
            ? `https://cdn.discordapp.com/avatars/${id}/${avatarHash}.jpg`
            : "./img/default.png";

          return (
            <img
              onError={e => {
                // @ts-ignore
                e.target.onerror = null;
                // @ts-ignore
                e.target.src = "./img/default.png";
              }}
              className={classes.avatar}
              style={{
                // border: `3px solid ${getIconColor()}`,
                filter: `${item.selfDeafened ? "grayscale(90%)" : "none"}`,
              }}
              alt="avatar"
              src={avatarUrl}
            />
          );
        })}
      </div>
    </Root>
  );
};

export default UserGridView;
