import { useEffect, useRef } from "react";
import { IUser } from "../types/user";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";
import { Typography, Box } from "@mui/material";
import { styled } from "@mui/system";
import { DiscordAvatar } from "../components/DiscordAvatar";

const PREFIX = "UserGridView";
const classes = {
  root: `${PREFIX}-root`,
  users: `${PREFIX}-users`,
};

// TODO: this is repeated
const Root = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
  },
  [`& .${classes.users}`]: {
    display: "flex",
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

      <div className={classes.users}>
        {users.map((props: IUser) => (
          <DiscordAvatar {...props} />
        ))}
      </div>
    </Root>
  );
};

export default UserGridView;
