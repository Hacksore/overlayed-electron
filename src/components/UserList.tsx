import UserItem from "../components/UserItem";
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
    </div>
  );
};

export default UserList;
