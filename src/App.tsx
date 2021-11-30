import { Root } from "./style";
import { useAppSelector, useHistoryDispatch, useHistorySelector } from "./hooks/redux";
import Toolbar from "./components/Toolbar";
import UserListView from "./views/UserListView";
import LoginView from "./views/LoginView";
import SettingsView from "./views/SettingsView";
import { RootState, HistoryState } from "./store";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";

import socketSerivce from "./services/socketService";
import { useEffect, useState } from "react";
import ConnectionFailedView from "./views/ConnectionFailedView";

// init socket service, no need for a hook
socketSerivce.init();

// Put this somewhere else?
declare global {
  interface Window {
    electron: {
      send: Function;
      receive: Function;
      openInBrowser: Function;
      openDirectory: Function;
      platform: string;
      home: string;
    };
  }
}

function App() {
  const users = useAppSelector((state: RootState) => state.root.users);
  const currentRoute = useHistorySelector((state: HistoryState) => state.history.currentRoute);

  const [divHeight, setDivHeight] = useState<number>(0);
  const navigate = useNavigate();
  const dispatch = useHistoryDispatch();
  const location = useLocation();

  // side effect to only start sending resize events when there are users
  // stops it from happening on the auth window
  useEffect(() => {
    if (users.length > 0 && location.pathname !== "/settings") {
      socketSerivce.send({ event: "WINDOW_RESIZE", data: { height: divHeight + 68 } });
    }
  }, [users.length, divHeight, location]);

  // this side effect allows us to control the route outside of a react comp
  // not quite sure that this is ideal but it works for now
  useEffect(() => {
    if (currentRoute && currentRoute !== location.pathname) {
      navigate(currentRoute);
    }
  }, [currentRoute, location, dispatch, navigate]);

  return (
    <Root>
      <Toolbar />
      <Routes>
        <Route path="/login" element={<LoginView />} />
        <Route path="/list" element={<UserListView setDivHeight={setDivHeight} />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/failed" element={<ConnectionFailedView />} />
      </Routes>
    </Root>
  );
}

export default App;
