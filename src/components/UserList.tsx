import UserItem from "../components/UserItem";
import { Button, Typography } from "@mui/material";
import { IUser } from "../types/user";
import { RootState } from "../store";
import { useAppSelector } from "../hooks/redux";

const UserList = () => {
  const users = useAppSelector((state: RootState) => state.root.users);

  return (
    <div style={{ overflowY: "auto", height: "100vh" }}>
      {users.map((item: IUser) => (
        <UserItem key={item.id} {...item} />
      ))}

      {/* TODO: add a FTUE component and a sync component */}
      {users.length <= 0 && (
        <div>
          <Typography color="primary">Sync current channel</Typography>
          <Button
            onClick={() => {
              console.log(1);
              // find channel im in and then tell electron to call subscribeEvents
              // const user = users.find(item => )

              // window.electron.send("toMain", { event: "SUBSCRIBE_EVENTS", channelId:  });
            }}
            variant="contained"
          >
            Click here to sync
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserList;
