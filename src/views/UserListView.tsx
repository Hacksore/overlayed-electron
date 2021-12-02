import { useEffect, useRef } from "react";
import { UserItem } from "../components/UserItem";
import { IUser } from "../types/user";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";
import { Typography, Box } from "@mui/material";
import { styled, darken } from "@mui/system";

const PREFIX = "UserList";
const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    padding: "0 12px 6px 12px",
    maxHeight: 980,
    overflowY: "auto",
    "::-webkit-scrollbar": {
      width: 10,
    },
    "::-webkit-scrollbar-track": {
      background: "rgba(0, 0, 0, 0.3)",
    },
    "::-webkit-scrollbar-thumb": {
      background: darken(theme.palette.secondary.main, 0.6),
      borderRadius: 10,
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: darken(theme.palette.secondary.main, 0.4),
    },
  },
}));

const UserList = ({ setDivHeight }: { setDivHeight: Function }) => {
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

      {users.map((item: IUser) => (
        <UserItem key={item.id} {...item} />
      ))}
    </Root>
  );
};

export default UserList;
