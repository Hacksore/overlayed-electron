import app from "./main";
import log from "electron-log";
import ElectronStore from "electron-store";

const settingsStore = new ElectronStore({ name: "settings" });
const level: any = settingsStore.get("log_level", "info");
log.transports.console.level = level;

app();