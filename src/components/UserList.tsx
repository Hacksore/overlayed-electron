import { useEffect, useRef } from "react";
import UserItem from "../components/UserItem";
import { IUser } from "../types/user";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";
import { Typography } from "@mui/material";
import { styled } from "@mui/system";

const PREFIX = "UserList";
const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    padding: "6px 12px 6px 12px",
    marginTop: 8,
    // maxHeight: 600,
    // overflowY: "auto",
    // TODO: figure out how to make this a bit more dynamic
  },
}));

const UserList = ({ setDivHeight }: { setDivHeight: Function }) => {
  const users = useAppSelector((state: RootState) => state.root.users);
  const listRef = useRef<any>(null);

  useEffect(() => {
    const height: number = listRef?.current?.offsetHeight || 0;
    setDivHeight(height);
  }, [users, setDivHeight]);

  return (
    <Root ref={listRef} className={classes.root}>
      {users.length <= 0 && (
        <Typography
          color="textPrimary"
          variant="h5"
        >
          No users in channel
        </Typography>
      )}

      {users.map((item: IUser) => (
        <UserItem key={item.id} {...item} />
      ))}
    </Root>
  );
};

export default UserList;
