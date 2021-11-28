// TODO: add typescript support but searching the web it seems this is way more involed
const path = require("path");
const { app, BrowserWindow, ipcMain, globalShortcut, dialog, shell, Tray, Menu, nativeTheme } = require("electron");
const isDev = require("electron-is-dev");
const SocketManager = require("./socket");
const ElectronStore = require("electron-store");
const { LOGIN_URL } = require("./constants");
const fs = require("fs");

const PORT = 3000;

const store = new ElectronStore();
const iconFile = process.platform === "darwin" ? "icon-mac.icns" : "icon.png";
const iconPath = `${__dirname}/img/${iconFile}`;

let win = null;
let authWin = null;
let socketManager = null;
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
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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
        evt: "PINNED_STATUS",
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
    label: "Help",
    click: () => {
      shell.openExternal("https://github.com/Hacksore/overlayed/issues");
    },
  },
  {
    label: "Quit",
    click: function () {
      app.isQuiting = true;
      app.quit();
    },
  },
]);

function createWindow() {
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
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  win.setAlwaysOnTop(overlayed.isPinned, "floating");

  // load up the socket manager
  socketManager = new SocketManager({
    win,
    overlayed,
  });

  // load socket manager to handle all IPC and socket events
  ipcMain.on("toMain", (_, msg) => {
    const payload = JSON.parse(msg);
    socketManager.onElectronMessage(msg);

    // check if we got told to open auth window
    if (payload.evt === "LOGIN") {
      if (!authWin) {
        createAuthWindow();
        authWin.show();
      }
    }

    if (payload.evt === "I_AM_READY") {
      console.log("Got ready event from renderer process");

      const auth = store.get("auth");
      if (auth) {
        overlayed.auth = JSON.parse(JSON.stringify(auth));
        socketManager.setupListeners();

        // tell client auth is done
        socketManager.sendElectronMessage({
          evt: "OAUTH_DANCE_COMPLETED",
          data: overlayed.auth,
        });
      }
    }

    if (payload.event === "TOGGLE_CLICKTHROUGH") {
      toggleClickthrough();
    }

    if (payload.event === "WINDOW_RESIZE") {
      win.setSize(400, clamp(payload.data.height, 100, 1400));
    }

    // Crude but works for now
    if (payload.event === "LOGOUT") {
      const appDir = app.getPath("userData");      
      fs.writeFileSync(`${appDir}/config.json`, "{}");
      app.quit();
    }
  });

  win.loadURL(isDev ? `http://localhost:${PORT}#/login` : `file://${path.join(__dirname, "../index.html#/login")}`);
}

function createAuthWindow() {
  // Create the browser window.
  authWin = new BrowserWindow({
    width: 550,
    height: 800,
    frame: true,
    icon: iconPath,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  authWin.on("close", () => {
    authWin = null;
  });

  // load the auth url
  authWin.loadURL(LOGIN_URL);

  // TODO: this is rather insecure as the window can be seen for a split second with your token
  authWin.webContents.on("will-navigate", function (event, newUrl) {
    // More complex code to handle tokens goes here
    authWin.webContents.session.webRequest.onCompleted({ urls: [newUrl] }, details => {
      if (details.url.includes("code=")) {
        authWin.webContents.executeJavaScript(`
          const payload = { event: 'AUTH', data: document.getElementsByTagName('pre')[0].innerHTML };
          window.electron.send('toMain', payload)
        `);
      } else {
        dialog.showMessageBox(win, {
          message: "Something went wrong authenticating, you might not have access!",
        });

        shell.openExternal("https://github.com/Hacksore/overlayed/issues/2");

        authWin.close();
        authWin = null;
      }
    });
  });

  // get auth token back over IPC - C R I N G E
  ipcMain.on("toMain", (_, msg) => {
    const payload = JSON.parse(msg);

    if (payload.event === "AUTH") {
      overlayed.auth = JSON.parse(payload.data);

      if (authWin) {
        authWin.close();
        authWin = null;
      }

      socketManager.setupListeners();

      // tell client auth is done
      socketManager.sendElectronMessage({
        evt: "OAUTH_DANCE_COMPLETED",
        data: overlayed.auth, // TODO: we probably don't need this
      });

      // save token to store
      store.set("auth", overlayed.auth);
    }
  });
}

function toggleClickthrough() {
  overlayed.clickThrough = !overlayed.clickThrough;
  // inform the UI to toggle the overlay
  socketManager.sendElectronMessage({
    evt: "CLICKTHROUGH_STATUS",
    value: overlayed.clickThrough,
  });

  // enableing click through
  win.setIgnoreMouseEvents(overlayed.clickThrough);

  // update the state for the menu item
  contextMenu.items[1].checked = overlayed.clickThrough;
}

app
  .whenReady()
  .then(() => {
    // add tray icon
    const trayIconTheme = nativeTheme.shouldUseDarkColors ? "light" : "dark";
    const trayIconPath = path.resolve(`${__dirname}/../img/trayicon-${trayIconTheme}.png`);
    tray = new Tray(trayIconPath);

    tray.setToolTip("Overlayed");
    tray.setContextMenu(contextMenu);

    tray.on("click", function (event) {});

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
