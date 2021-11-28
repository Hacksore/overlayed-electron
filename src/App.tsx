import { Root } from "./style";
import { useAppSelector } from "./hooks/redux";
import Toolbar from "./components/Toolbar";
import UserListView from "./views/UserListView";
import LoginView from "./views/LoginView";
import SettingsView from "./views/SettingsView";
import { RootState } from "./store";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";

import socketSerivce from "./services/socketService";
import { useEffect, useState } from "react";

// init socket service, no need for a hook
socketSerivce.init();

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
  const userId = useAppSelector((state: RootState) => state.root.profile?.id);

  const [divHeight, setDivHeight] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  // side effect to only start sending resize events when there are users
  // stops it from happening on the auth window
  useEffect(() => {
    if (users.length > 0 && location.pathname !== "/settings") {
      socketSerivce.send({ evt: "WINDOW_RESIZE", data: { height: divHeight + 68 } });
    }
  }, [users.length, divHeight, location]);

  // side effect to route them to the list when authed
  useEffect(() => {
    if (isAuthed && !userId) {
      navigate("list");
    }
  }, [isAuthed, userId, navigate]);

  return (
    <Root>
      <Toolbar />
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/list" element={<UserListView setDivHeight={setDivHeight} />} />
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </Root>
  );
}

export default App;
