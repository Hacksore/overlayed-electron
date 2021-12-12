import * as path from "path";
import { app, BrowserWindow, ipcMain, globalShortcut, shell, Tray, Menu, nativeTheme } from "electron";
import ElectronStore from "electron-store";
import { LOGIN_URL } from "./constants";
import SocketManager from "./socket";
import { isDiscordRunning } from "../common/util";
import AuthServer from "./auth";
import { CustomEvents } from "../common/constants";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

const APP_BASE_PATH = app.isPackaged
  ? path.resolve(`${__dirname}/../renderer`)
  : path.resolve(`${__dirname}/../../public`);

const authStore = new ElectronStore({ name: "auth" });
const settingsStore = new ElectronStore({ name: "settings" });

const iconFile = process.platform === "darwin" ? "icon-mac.icns" : "icon.png";
const iconPath = `${__dirname}/img/${iconFile}`;

let win: BrowserWindow;
let authWin: BrowserWindow;
let authApp: any = null;
let socketManager: any = null;
let tray = null;

// use this namespace to be able to pass by ref to other files
const overlayed = {
  auth: {
    accessToken: null,
    refreshToken: null,
    expiresIn: null,
    type: null,
  },
  userProfile: null,
  curentChannelId: null,
  lastChannelId: null,
  clickThrough: false,
  isPinned: false,
};

// util method
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

// make global
const contextMenu = Menu.buildFromTemplate([
  {
    label: "Always on Top",
    click: () => {
      // TODO: Code this is duplicated from socket.js - needs some DRYing up
      overlayed.isPinned = !overlayed.isPinned;

      win.setAlwaysOnTop(overlayed.isPinned, "floating");
      win.setVisibleOnAllWorkspaces(true);
      win.setFullScreenable(false);

      socketManager.sendElectronMessage({
        evt: CustomEvents.PINNED_STATUS,
        value: overlayed.isPinned,
      });
    },
    type: "checkbox",
  },
  {
    label: "Clickthrough",
    type: "checkbox",
    click: function () {
      toggleClickthrough();
    },
  },
  {
    type: "separator",
  },
  {
    label: "Toggle Devtools",
    click: function () {
      win.webContents.openDevTools();
    },
  },
  {
    label: "Help",
    click: () => {
      shell.openExternal("https://github.com/Hacksore/overlayed/issues");
    },
  },
  {
    label: "Quit",
    click: function () {
      app.quit();
    },
  },
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 400,
    minHeight: 200,
    height: 590,
    transparent: true,
    frame: false,
    icon: iconPath,
    hasShadow: false,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/index.cjs"),
    },
  });

  win.setAlwaysOnTop(overlayed.isPinned, "floating");

  // load up the socket manager
  socketManager = new SocketManager({
    win,
    overlayed,
  });

  // load socket manager to handle all IPC and socket events
  ipcMain.on("toMain", async (_, msg) => {
    const payload = JSON.parse(msg);

    socketManager.onElectronMessage(msg);

    // TODO: this needs to be implemented
    // setup some ping to the client so we cant later on detect when it's not running
    // setInterval(() => {
    // socketManager.client.transport.ping();
    // }, 5000);

    // check if we got told to open auth window
    if (payload.evt === CustomEvents.CONNECTED_TO_DISCORD) {
      console.log("Stopping the auth serivce as we are connected");
      authApp.close();
      authApp = null;
    }

    // check if we got told to open auth window
    if (payload.evt === CustomEvents.LOGIN) {
      if (!authWin) {
        shell.openExternal(LOGIN_URL);
      }
    }

    if (payload.evt === CustomEvents.I_AM_READY) {
      log.info("Got ready event from renderer process");

      const auth = authStore.get("auth");
      if (auth) {
        overlayed.auth = JSON.parse(JSON.stringify(auth));
        socketManager.setupListeners();

        // tell client auth is done
        socketManager.sendElectronMessage({
          evt: CustomEvents.OAUTH_DANCE_COMPLETED,
          data: overlayed.auth,
        });
      }
    }

    if (payload.event === CustomEvents.TOGGLE_CLICKTHROUGH) {
      toggleClickthrough();
    }

    if (payload.event === CustomEvents.WINDOW_RESIZE) {
      win.setSize(400, clamp(payload.data.height, 100, 1400));
    }

    // Crude but works for now
    if (payload.event === CustomEvents.LOGOUT) {
      authStore.set("auth", null);
      app.quit();
    }

    // check for discord to be running
    if (payload.event === CustomEvents.CHECK_FOR_DISCORD) {
      console.log("Test for client");
      // first thing is test if discord is running and if not make sure they visit a new page

      const isClientRunning = await isDiscordRunning();
      console.log("Is discord client running", isClientRunning);

      if (isClientRunning) {
        socketManager.sendElectronMessage({
          evt: CustomEvents.DISCORD_RUNNING,
        });
      } else {
        socketManager.sendElectronMessage({
          evt: CustomEvents.DISCONNECTED_FROM_DISCORD,
        });
      }
    }

    // allows us to proxy messages to the discord ipc from the front end
    if (payload.event === CustomEvents.DISCORD_MESSAGE) {
      socketManager.sendDiscordMessage(payload.data);
    }
  });

  // first thing is test if discord is running and if not make sure they visit a new page
  const isClientRunning = await isDiscordRunning();
  const appPath = isClientRunning ? "login" : "failed";

  if (app.isPackaged) {
    const mainUrl = path.join(__dirname, "../renderer/index.html");
    win.loadURL(`file://${mainUrl}#/${appPath}`);
  } else {
    const pkg = await import("../../package.json");
    const url = `http://${pkg.env.HOST || "127.0.0.1"}:${pkg.env.PORT}`;

    win.loadURL(`${url}#/${appPath}`);
  }
}

/**
 * Create a simple express server waiting for a POST
 * from the main site with a valid auth token
 */
async function createAuthService() {
  const authService = new AuthServer();

  authService.on("token", auth => {
    overlayed.auth = { ...auth };

    socketManager.setupListeners();

    // tell client auth is done
    socketManager.sendElectronMessage({
      evt: "OAUTH_DANCE_COMPLETED",
      data: overlayed.auth, // TODO: we probably don't need this
    });

    // save token to store
    authStore.set("auth", overlayed.auth);

    // bring window to top after getting a token
    win.show();

    // close service down
    authService.close();
  });
}

createAuthService();

function toggleClickthrough() {
  overlayed.clickThrough = !overlayed.clickThrough;
  // inform the UI to toggle the overlay
  socketManager.sendElectronMessage({
    evt: CustomEvents.CLICKTHROUGH_STATUS,
    value: overlayed.clickThrough,
  });

  // enableing click through
  win.setIgnoreMouseEvents(overlayed.clickThrough);

  // update the state for the menu item
  contextMenu.items[1].checked = overlayed.clickThrough;

  // focus window
  win.show();
}

const init = () => {
  app
    .whenReady()
    .then(() => {
      // add tray icon
      if (!settingsStore.get("hideTrayIcon")) {
        const trayIconTheme = nativeTheme.shouldUseDarkColors ? "light" : "dark";
        const trayIconPath = `${APP_BASE_PATH}/img/trayicon-${trayIconTheme}.png`;
        tray = new Tray(trayIconPath);

        tray.setToolTip("Overlayed");
        tray.setContextMenu(contextMenu);

        tray.on("click", () => {
          win.focus();
        });
      }

      // TODO: allow custom keybindings
      globalShortcut.register("Control+Shift+Space", toggleClickthrough);
    })
    .then(() => {
      // create the main window no matter what
      createWindow();
    });

  // TODO: if we turn this off we need a global hotkey to refocus it
  // app.dock.hide();

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // auto update
  function sendStatusToWindow(text: string) {
    log.info(text);

    socketManager.sendElectronMessage({
      evt: CustomEvents.AUTO_UPDATE,
      data: {
        message: text
      }
    });
  }

  autoUpdater.on("checking-for-update", () => {
    sendStatusToWindow("Checking for update...");
  });

  autoUpdater.on("update-available", () => {
    sendStatusToWindow("Update available.");
  });

  autoUpdater.on("update-not-available", () => {
    sendStatusToWindow("Update not available.");
  });

  autoUpdater.on("error", err => {
    sendStatusToWindow("Error in auto-updater. " + err);
  });

  autoUpdater.on("download-progress", progressObj => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + " - Downloaded " + progressObj.percent + "%";
    log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")";
    sendStatusToWindow(log_message);
  });

  autoUpdater.on("update-downloaded", () => {
    sendStatusToWindow("Update downloaded");
  });

};

export default init;
