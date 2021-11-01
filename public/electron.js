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

    if (payload.event === "I_AM_READY") {
      if (socketManager) {
        socketManager.destroy();
        socketManager = null;
      } else {
        socketManager = new SocketManager(win);
      }
    }

    if (payload.event === "TOGGLE_PIN") {
      isPinned = !isPinned;
      win.setAlwaysOnTop(isPinned, "floating");
      win.setVisibleOnAllWorkspaces(true);
      win.setFullScreenable(false);
    }
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  win.loadURL(
    isDev ? "http://localhost:3001" : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // disalbe frame prot
  // win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: Object.fromEntries(
  //       Object.entries(details.responseHeaders).filter(
  //         (header) => !/x-frame-options/i.test(header[0])
  //       )
  //     ),
  //   });
  // });
}

app.whenReady().then(createWindow);

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
