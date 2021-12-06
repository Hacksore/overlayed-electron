/* eslint-disable no-undef */
import { shell, contextBridge, ipcRenderer } from "electron";

import ElectronStore from "electron-store";

const store = new ElectronStore({
  name: "settings",
  configFileMode: 0x666
});

contextBridge.exposeInMainWorld("electron", {
  send: (channel: string, data: any) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, JSON.stringify(data));
    }
  },
  receive: (channel: string, func: Function) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  },
  setConfigValue: (key: string, value: string) => {
    store.set(key, value);
  },
  getConfigValue: (key: string) => {
    return store.get(key);
  },
  openInBrowser: (url: string) => {
    shell.openExternal(url);
  },
  openDirectory: (url: string) => {
    shell.openPath(url);
  },
  platform: process.platform,
  home: process.env.HOME,
  appData: process.env.APPDATA,
});
