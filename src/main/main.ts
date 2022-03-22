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
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";

import pkg from "../../package.json";

const APP_BASE_PATH = app.isPackaged
  ? path.resolve(`${__dirname}/../renderer`)
  : path.resolve(`${__dirname}/../../public`);

const authStore = new ElectronStore({ name: "auth" });
const settingsStore = new ElectronStore({ name: "settings" });

const iconFile = process.platform === "darwin" ? "icon-mac.icns" : "icon.png";
const iconPath = `${__dirname}/img/${iconFile}`;

let win: BrowserWindow;
let authWin: BrowserWindow;
let socketManager: SocketManager;
let authService: any = null;
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
  canUpdate: false,
};

// util method
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

// make global
const contextMenu = Menu.buildFromTemplate([
  {
    label: `Overlayed ${pkg.version}`,
    enabled: false,
  },
  {
    type: "separator",
  },
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
    label: "Check for updates",
    click: () => {
      autoUpdater.checkForUpdatesAndNotify();
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

  // load the auth service
  authService = new AuthServer();

  // create auth service
  createAuthService();

  // load socket manager to handle all IPC and socket events
  ipcMain.on("toMain", async (_, msg) => {
    const payload = JSON.parse(msg);

    socketManager.onElectronMessage(msg);

    // check if we should apply update
    if (payload.evt === CustomEvents.APPLY_UPDATE) {
      app.relaunch();
      app.quit();
    }

    // check if we got told to open auth window
    if (payload.evt === CustomEvents.LOGIN) {
      if (!authWin) {
        shell.openExternal(LOGIN_URL);
      }
    }

    if (payload.evt === CustomEvents.I_AM_READY) {
      log.info("Got ready event from renderer process");

      // we are not authed move client to the login page only if discord is running
      const isClientRunning = await isDiscordRunning();
      log.debug("Is discord client running", isClientRunning);
      const auth = authStore.get("auth");
      // we are going to try the auth token we have to setup listeners
      // there is not guarantee that the token works so we have to handle that elsewhere
      if (auth && isClientRunning) {
        overlayed.auth = JSON.parse(JSON.stringify(auth));
        log.debug(overlayed.auth);

        socketManager.setupListeners();

      } else {

        log.debug("Was not able to setup discord listeners - tell client");
        socketManager.sendElectronMessage({
          evt: CustomEvents.LOGIN_FAILED,
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
      if (payload.data?.clearAuth) {
        authStore.set("auth", null);
      }

      if (payload.data?.relaunch) {
        app.relaunch();
      }

      app.quit();
    }

    // check for discord to be running
    if (payload.event === CustomEvents.CHECK_FOR_DISCORD) {
      const isClientRunning = await isDiscordRunning();
      log.info("Is discord client running", isClientRunning);

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

  // default to loading route
  setBrowserPath("/loading");
}

// create method to set page url
async function setBrowserPath(newPath: string) {
  // if we are on this route already skeeeep
  if (getBrowserPath() === newPath) {
    return;
  }

  if (app.isPackaged) {
    const mainUrl = path.join(__dirname, "../renderer/index.html");
    win.loadURL(`file://${mainUrl}#${newPath}`);
  } else {
    const pkg = await import("../../package.json");
    const url = `http://${pkg.env.HOST || "127.0.0.1"}:${pkg.env.PORT}`;

    win.loadURL(`${url}#${newPath}`);
  }
}

// get the current path ex: /loading
function getBrowserPath(): string {
  const url = win.webContents.getURL();
  return url.split("#")[1];
}

/**
 * Create a simple express server waiting for a POST
 * from the main site with a valid auth token
 */
async function createAuthService() {
  authService.on("token", (auth: any) => {
    overlayed.auth = { ...auth };

    socketManager.setupListeners();

    // save token to store
    authStore.set("auth", overlayed.auth);

    // bring window to top after getting a token
    win.show();
    win.focus();
    win.moveTop();

    // close service down
    if (authService) {
      authService.close();
    }
  });
}

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

      // install devtools when not packed
      if (!app.isPackaged) {
        installExtension([REACT_DEVELOPER_TOOLS.id, REDUX_DEVTOOLS.id])
          .then(name => log.debug(`Added Extension:  ${name}`))
          .catch(err => log.debug("An error occurred: ", err));
      }

      // check for updates and notify
      setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
      }, 1000 * 60 * 60); // every 60 minutes

      // ping the discord client
      setInterval(() => {
        // socketManager.client.transport.ping();
      }, 1000 * 60); // every minute
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

  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for update...");
  });

  autoUpdater.on("update-available", data => {
    log.info("Update avilable", data);

    socketManager.sendElectronMessage({
      evt: CustomEvents.AUTO_UPDATE,
      data: {
        hasUpdate: true,
        version: data.version,
      },
    });
  });

  autoUpdater.on("update-not-available", () => {
    log.info("No updates available now");
  });

  autoUpdater.on("error", () => {
    log.info("Error updating");
  });

  autoUpdater.on("update-downloaded", () => {
    log.info("Update download finished");
    overlayed.canUpdate = true;
  });

  // single instance
  app.requestSingleInstanceLock();
  app.on("second-instance", () => {
    // app.quit();
    // TODO: figure out how to best handle this
  });
};

export default init;
