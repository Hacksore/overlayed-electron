// @ts-ignore
// HACK: to not have client complain about node-fetch
import { RPCCommands, RPCEvents } from "@hacksore/discord-rpc/src/constants";


export enum CustomEvents {
  WINDOW_RESIZE = "WINDOW_RESIZE",
  PINNED_STATUS = "PINNED_STATUS",
  LOGOUT = "LOGOUT",
  READY = "READY",
  TOGGLE_CLICKTHROUGH = "TOGGLE_CLICKTHROUGH",
  CLICKTHROUGH_STATUS = "CLICKTHROUGH_STATUS",
  CHECK_FOR_DISCORD = "CHECK_FOR_DISCORD",
  DISCONNECTED_FROM_DISCORD = "DISCONNECTED_FROM_DISCORD",
  SET_HOTKEY = "SET_HOTKEY",
}

export {
  RPCCommands,
  RPCEvents
}