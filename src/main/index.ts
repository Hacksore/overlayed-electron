import app from "./main";
import log from "electron-log";
import ElectronStore from "electron-store";

const { NODE_ENV } = process.env;

const settingsStore = new ElectronStore({ name: "settings" });
const level: any = settingsStore.get("log_level", NODE_ENV === "production" ? "info" : "debug");
log.transports.console.level = level;

app();