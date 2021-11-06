const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const SocketManager = require("./socket");

require("./socket");

let win;
let socketManager;
let isPinned = false;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 400,
    minHeight: 200,
    height: 590,
    useContentSize: true,
    transparent: true,
    frame: false,
    icon: __dirname + "./img/icon.png",
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  // load socket manager
  ipcMain.on("toMain", (event, data) => {
    const payload = JSON.parse(data);

    if (payload.event === "TOGGLE_DEVTOOLS") {
      win.webContents.openDevTools();
    }

    if (payload.event === "I_AM_READY") {
      if (socketManager) {
        socketManager.destroy();
        socketManager = null;
      } else {
        socketManager = new SocketManager(win);
      }
    }

    if (payload.event === "AUTH") {
      socketManager.send(payload.data);
    }

    if (payload.event === "REQUEST_CURRENT_CHANNEL") {
      socketManager.requestCurrentChannel();
    }

    if (payload.event === "SUBSCRIBE_CHANNEL") {
      const { channelId } = payload.data;

      // request to sub to new channel events
      socketManager.subscribeEvents(channelId);

      // ask for all the users?
      socketManager.fetchUsers(channelId);
    }

    if (payload.event === "TOGGLE_PIN") {
      isPinned = !isPinned;

      win.setAlwaysOnTop(isPinned, "floating");
      win.setVisibleOnAllWorkspaces(true);
      win.setFullScreenable(false);

      // swithc with ipc not discord socket lol
      win.webContents.send("fromMain", JSON.stringify({
        evt: "PINNED_STATUS",
        value: isPinned        
      }));
    }
  });

  win.loadURL(isDev ? "http://localhost:3001" : `file://${path.join(__dirname, "../build/index.html")}`);
}

app.whenReady().then(createWindow);

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
