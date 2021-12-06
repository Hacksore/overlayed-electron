import { FC } from "react";
import { Menu, MenuItem, Typography } from "@mui/material";
import { RootState } from "../store";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { appSlice } from "../reducers/rootReducer";
import { styled } from "@mui/system";
const { setContextMenu } = appSlice.actions;

const PREFIX = "ContextMenu";
const classes = {
  root: `${PREFIX}-root`,
  list: `${PREFIX}-list`,
  paper: `${PREFIX}-paper`,
};

export const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    background: "red",
    position: "none",
  },
  [`& .${classes.list}`]: {
    padding: 0,
    width: 120,
    "& li": {
      padding: "0 14px 0 14px",
      height: 38,
    },
  },
  [`& .${classes.paper}`]: {
    padding: 0,
  },
}));

export const ContextMenu: FC = () => {
  const contextMenu = useAppSelector((state: RootState) => state.root.contextMenu);
  const users = useAppSelector((state: RootState) => state.root.users);
  const dispatch = useAppDispatch();
  const handleClose = (event: any) => {

    dispatch(
      setContextMenu({
        open: false,
        x: 0,
        y: 0,
      })
    );
  };

  const userInfo = users.find(item => item.id === contextMenu.id);

  return (
    <Root>
      <Menu
        open={contextMenu.open}
        onClose={handleClose}
        hideBackdrop
        classes={{ root: classes.root, list: classes.list, paper: classes.paper }}
        anchorReference="anchorPosition"
        disablePortal={true}
        anchorPosition={contextMenu !== null ? { left: contextMenu.x, top: contextMenu.y } : undefined}
      >
        <Typography sx={{ padding: 1 }} onClick={handleClose}>
          {userInfo?.username}
        </Typography>
        <MenuItem onClick={handleClose}>Mute</MenuItem>
        {/* <Divider />
        <Slider
          aria-label="Volume"
          value={volume}
          min={0}
          max={100}
          onChange={(event: any) => {
            setVolume(event.target.value);

          }}
        />
        <Divider /> */}
        <MenuItem onClick={handleClose}>Cancel</MenuItem>
      </Menu>
    </Root>
  );
};
