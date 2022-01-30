import { Root } from "./style";
import { useAppSelector } from "./hooks/redux";
import Toolbar from "./components/Toolbar";
import UserLayoutView from "./views/UserLayoutView";
import LoginView from "./views/LoginView";
import SettingsView from "./views/SettingsView";
import { RootState } from "./store";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";

import socketSerivce from "./services/socketService";
import { useEffect, useState } from "react";
import ConnectionFailedView from "./views/ConnectionFailedView";
import { ContextMenu } from "./components/ContextMenu";
import { CustomEvents } from "../../common/constants";
import LoadingView from "./views/LoadingView";

// TODO: figure out how to use electron-log on client

// Put this somewhere else?
declare global {
  interface Window {
    electron: {
      send: (key: string, val: any) => void;
      receive: (key: string, fn: any) => void;
      openInBrowser: (path: string) => void;
      openDirectory: (path: string) => void;
      platform: string;
      home: string;
      appData: string;
      setConfigValue: (key: string, val: any) => void;
      getConfigValue: (key: string) => any;
      version: string;
    };
  }
}

function App() {
  const users = useAppSelector((state: RootState) => state.root.users);
  const [divHeight, setDivHeight] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // init socket service, no need for a hook
    console.info("Load socket service");

    // init socket service
    socketSerivce.init(navigate);

    // disble mouse buttons
    window.addEventListener("mouseup", (e) => {
      if (e.button === 3 || e.button === 4) e.preventDefault();
    });

  }, []);

  // side effect to only start sending resize events when there are users
  // stops it from happening on the auth window
  useEffect(() => {
    if (users.length > 0 && location.pathname === "/list") {
      socketSerivce.send({
        event: CustomEvents.WINDOW_RESIZE,
        data: { height: divHeight + 68 },
      });
    }
  }, [users.length, divHeight, location]);

  return (
    <Root>
      <Toolbar />
      <Routes>
        <Route path="/loading" element={<LoadingView />} />
        <Route path="/login" element={<LoginView />} />
        <Route
          path="/list"
          element={<UserLayoutView setDivHeight={setDivHeight} />}
        />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/failed" element={<ConnectionFailedView />} />
      </Routes>

      <ContextMenu />
    </Root>
  );
}

export default App;
