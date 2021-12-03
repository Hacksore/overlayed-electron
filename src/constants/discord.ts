// @ts-ignore
import * as RPC from "@hacksore/discord-rpc";

export const RPCCommands = RPC.Commands;
export const RPCEvents = RPC.Events;

export enum CustomEvents {
  WINDOW_RESIZE = "WINDOW_RESIZE",
  PINNED_STATUS = "PINNED_STATUS",
  LOGOUT = "LOGOUT",
  READY = "READY",
  TOGGLE_CLICKTHROUGH = "TOGGLE_CLICKTHROUGH",
  CLICKTHROUGH_STATUS = "CLICKTHROUGH_STATUS",
  SET_HOTKEY = "SET_HOTKEY",
}