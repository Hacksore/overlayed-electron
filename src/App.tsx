import { Root } from "./style";
import { useAppSelector } from "./hooks/redux";
import Toolbar from "./components/Toolbar";
import UserList from "./components/UserList";
import LoginView from "./components/LoginView";
import { RootState } from "./store";

import socketSerivce from "./services/socketService";
import { useEffect, useState } from "react";

// Put this somewhere else?
declare global {
  interface Window {
    electron: {
      send: Function;
      receive: Function;
      openInBrowser: Function;
    };
  }
}

function App() {
  const isAuthed = useAppSelector((state: RootState) => state.root.isAuthed);
  const users = useAppSelector((state: RootState) => state.root.users);
  const [divHeight, setDivHeight] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    socketSerivce.init();
  }, []);

  useEffect(() => {
    setUserCount(users.length);
  }, [users, divHeight]);

  useEffect(() => {
    if (userCount > 0) {
      socketSerivce.send({ evt: "WINDOW_RESIZE", data: { height: divHeight + 50 } });
    }
  }, [userCount, divHeight]);

  return (
    <Root>
      <Toolbar />
      {!isAuthed ? (
        <LoginView />
      ) : (
        <>
          <UserList setDivHeight={setDivHeight} />
        </>
      )}
    </Root>
  );
}

export default App;
