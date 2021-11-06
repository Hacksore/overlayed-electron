import UserItem from "../components/UserItem";
import { IUser } from "../types/user";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";
import { Typography } from "@mui/material";
import { styled } from "@mui/system";

const PREFIX = "UserList";
const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
};

const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    overflowY: "auto",
    height: "100vh",
  },
  [`&.${classes.header}`]: {
  },
}));

const UserList = () => {
  const users = useAppSelector((state: RootState) => state.root.users);

  return (
    <Root className={classes.root}>
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
