import { useState } from "react";
import UserListView from "./UserListView";
import UserGridView from "./UserGridView";

const UserLayoutView = ({ setDivHeight }: { setDivHeight: Function }) => {
  const [listStyle] = useState(localStorage.getItem("listStyle") || "list");

  return (
    <>
      {listStyle === "list" ? (
        <UserListView setDivHeight={setDivHeight} />
      ) : (
        <UserGridView setDivHeight={setDivHeight} />
      )}
    </>
  );
};

export default UserLayoutView;
