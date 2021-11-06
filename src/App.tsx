import { Root } from "./style";
import { useAppSelector } from "./hooks/redux";
import Toolbar from "./components/Toolbar";
import UserList from "./components/UserList";
import LoginView from "./components/LoginView";
import { RootState } from "./store";

import socketSerivce from "./services/socketService";
import { useEffect } from "react";

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
  
  useEffect(() => {    
    socketSerivce.init();    
  }, []);

  return (
    <Root>
      <Toolbar />
      {!isAuthed ? (
        <LoginView />
      ) : (
        <>
          <UserList />
        </>
      )}
    </Root>
  );
}

export default App;
