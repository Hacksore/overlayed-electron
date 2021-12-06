import { app, BrowserWindow } from "electron";
import type { BrowserWindowConstructorOptions } from "electron";
import path from "path";

const isDevelopment = !app.isPackaged;

const iconFile = process.platform === "darwin" ? "icon-mac.icns" : "icon.png";
const iconPath = `${__dirname}/img/${iconFile}`;

function createWindow() {
  const windowOptions: BrowserWindowConstructorOptions = {
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
      preload: path.join(__dirname, "../../build/main/preload.cjs"),
    },
  };

  const browserWindow = new BrowserWindow(windowOptions);

  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
    browserWindow.focus();
  });

  browserWindow.webContents.openDevTools();

  const port = process.env.PORT || 3000;

  if (isDevelopment) {
    void browserWindow.loadURL(`http://localhost:${port}`);
  } else {
    void browserWindow.loadFile("./index.html");
  }
}

void app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
