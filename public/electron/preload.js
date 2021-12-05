/* eslint-disable no-undef */
const { contextBridge, ipcRenderer } = require("electron");
const { shell } = require("electron");

const ElectronStore = require("electron-store");
const store = new ElectronStore({ name: "settings" });

contextBridge.exposeInMainWorld("electron", {
  send: (channel, data) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, JSON.stringify(data));
    }
  },
  receive: (channel, func) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  },
  setConfigValue: (key, value) => {
    store.set(key, value);
  },
  getConfigValue: (key) => {
    return store.get(key);
  },
  openInBrowser: url => {
    shell.openExternal(url);
  },
  openDirectory: url => {
    shell.openPath(url);
  },
  platform: process.platform,
  home: process.env.HOME,
  appData: process.env.APPDATA,
});
