const { contextBridge, ipcRenderer } = require("electron");
const { shell } = require("electron");

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
  openInBrowser: (url) => {
    shell.openExternal(url);
  },
});
