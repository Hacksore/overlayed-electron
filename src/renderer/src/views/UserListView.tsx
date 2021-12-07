import { useEffect, useRef } from "react";
import { UserItem } from "../components/UserItem";
import { IUser } from "../types/user";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";
import { Typography, Box } from "@mui/material";
import { styled } from "@mui/system";
import { useScale } from "../hooks/useScale";
import settings from "../services/settingsService";

const PREFIX = "UserList";
const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled("div", {
  shouldForwardProp: prop => prop !== "scroll",
})<{ scroll: boolean }>(({ scroll }) => ({
  [`&.${classes.root}`]: {
    padding: "0 12px 6px 12px",
    maxHeight: 800,
    overflowY: scroll ? "none" : "auto",
  },
}));

const UserList = ({ setDivHeight }: { setDivHeight: (height: number) => void }) => {
  const users = useAppSelector((state: RootState) => state.root.users);
  const clickThrough = useAppSelector((state: RootState) => state.root.clickThrough);
  const listRef = useRef<any>(null);
  const scale = useScale();
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

      {users.map((item: IUser) => (
        <UserItem scale={scale} key={item.id} {...item} />
      ))}
    </Root>
  );
};

export default UserList;
