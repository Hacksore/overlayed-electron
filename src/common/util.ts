import net from "net";
import log from "electron-log";

function pid() {
  if (typeof process !== "undefined") {
    return process.pid;
  }
  return null;
}

function getIPCPath(id: number) {
  if (process.platform === "win32") {
    return `\\\\?\\pipe\\discord-ipc-${id}`;
  }
  const {
    env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP },
  } = process;
  const prefix = XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || "/tmp";
  return `${prefix.replace(/\/$/, "")}/discord-ipc-${id}`;
}

/**
 * This will attempt to enumerate over 0-10 indexes of the known IPC paths
 * and connect to the discord client, once a connection is made we return true
 * @param id the namped pipe socket index
 * @returns Promise<boolean>
 */
function testSocketConnection(id: number) {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection(getIPCPath(id), () => {
      resolve(`connected to discord @ index ${id}`);
      sock.end();
    });

    // set timeout, rather low but this should be in the miliseconds range
    sock.setTimeout(50);

    const handleFailure = () => {
      reject(`error connecting to discord @ index ${id}`);
      sock.end();      
    }

    sock.once("error", handleFailure);
    sock.once("close", handleFailure);
    sock.once("timeout", handleFailure)
  });
}

async function isDiscordRunning() {
  log.debug("Start isDiscordRunning...");

  for (let i = 0; i < 10; i++) {    
    try {
      const active = await testSocketConnection(i);
      log.debug("isDiscordRunning", `id ${i}`, active);
      if (active) {
        return true;
      }
    } catch (err) {
      log.debug("isDiscordRunning failed for", `id ${i}`);
    }
  }

  log.debug("Finish isDiscordRunning...");
  return false;
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export { pid, isDiscordRunning, uuid };
