const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const SocketManager = require("./socket");

require("./socket");

let win;
let socketManager;

// use this namespace to be able to pass by ref to other files
const overlayed = { accessToken: null, curentChannelId: null, lastChannelId: null, isPinned: true };

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 400,
    minHeight: 200,
    height: 590,
    transparent: true,
    frame: false,
    icon: __dirname + "./img/icon.png",
    hasShadow: false,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  win.setAlwaysOnTop(overlayed.isPinned, "floating");

  // enableing click through
  // win.setIgnoreMouseEvents(true);

  // load up the socket manager
  socketManager = new SocketManager({
    win,
    overlayed,
  });

  // load socket manager to handle all IPC and socket events
  ipcMain.on("toMain", (_, msg) => {
    socketManager.onElectronMessage(msg);
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
