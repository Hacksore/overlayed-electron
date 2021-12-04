import UserListView from "./UserListView";
import UserGridView from "./UserGridView";
import settings from "../services/settingsService";

const UserLayoutView = ({ setDivHeight }: { setDivHeight: Function }) => {
  const listStyle = settings.get("listStyle");

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
