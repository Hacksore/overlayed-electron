const path = require("path");
const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const isDev = require("electron-is-dev");
const SocketManager = require("./socket");
const PORT = process.env.PORT || 3000;

require("./socket");

const icon = process.platform !== "darwin" ? "logo.png" : "logo.icns";

let win;
let authWin;
let socketManager;

// use this namespace to be able to pass by ref to other files
const overlayed = {
  accessToken: null, // TODO: remove
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

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 400,
    minHeight: 200,
    height: 590,
    transparent: true,
    frame: false,
    icon: `${__dirname}/img/${icon}`,
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
    if (payload.event === "LOGIN") {
      if (!authWin) {
        createAuthWindow();

        authWin.show();
      }
    }
  });

  win.loadURL(isDev ? `http://localhost:${PORT}` : `file://${path.join(__dirname, "../build/index.html")}`);
}

function createAuthWindow() {
  // Create the browser window.
  authWin = new BrowserWindow({
    width: 550,
    height: 800,
    frame: true,
    icon: `${__dirname}/img/${icon}`,
    show: true,        
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  // load the auth url
  const authUrl =
    "https://discord.com/api/oauth2/authorize?client_id=905987126099836938&redirect_uri=https%3A%2F%2Fauth.overlayed.dev%2Foauth%2Fcallback&response_type=code&scope=rpc";
  authWin.loadURL(authUrl);

  authWin.webContents.on("will-navigate", function (event, newUrl) {
    // More complex code to handle tokens goes here
    authWin.webContents.session.webRequest.onCompleted({ urls: [newUrl] }, details => {
      // TODO: make better?
      if (details.url.includes("code=")) {
        authWin.webContents.executeJavaScript(`
          const payload = { event: 'AUTH', data: document.getElementsByTagName('pre')[0].innerHTML };
          window.electron.send('toMain', payload)
        `);
      }
    });
  });

  // get auth token back over IPC - C R I N G E
  ipcMain.on("toMain", (_, msg) => {
    const payload = JSON.parse(msg);

    if (payload.event === "AUTH") {      
      overlayed.auth = JSON.parse(payload.data);
      authWin.close();
      authWin = null;

      socketManager.setupAuthAndListeners();
      
      // tell client auth is done
      socketManager.sendElectronMessage({
        event: "OAUTH_DANCE_COMPLETED",
        data: overlayed.auth, // TODO: we probably don't need this
      });
    }
  });
}

app
  .whenReady()
  .then(() => {
    // TODO: allow custom keybindings
    globalShortcut.register("Control+Shift+Space", () => {
      overlayed.clickThrough = !overlayed.clickThrough;
      // inform the UI to toggle the overlay
      socketManager.sendElectronMessage({
        evt: "CLICKTHROUGH_STATUS",
        value: overlayed.clickThrough,
      });
      // enableing click through
      win.setIgnoreMouseEvents(overlayed.clickThrough);
    });
  })
  .then(() => {

    // // TODO: check if we have a token first and we don't create this
    // // if we don't have a token, create the auth window hidden and wait for client to tell us to start auth
    // createAuthWindow();

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
