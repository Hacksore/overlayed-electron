import net from "net";
import EventEmitter from "events";
import { uuid } from "../../common/util";
import { RPCCommands, RPCEvents } from "./constants";

const OPCodes = {
  HANDSHAKE: 0,
  FRAME: 1,
  CLOSE: 2,
  PING: 3,
  PONG: 4,
};

function getIPCPath(id: number) {
  if (process.platform === "win32") {
    const socketPath = `\\\\?\\pipe\\discord-ipc-${id}`;
    console.log(`Found winderz socket @ ${socketPath}`);
    return socketPath;
  }
  const {
    env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP },
  } = process;
  const prefix = XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || "/tmp";
  const socketPath = `${prefix.replace(/\/$/, "")}/discord-ipc-${id}`;
  console.log(`Found *nix socket @ ${socketPath}`);
  return socketPath;
}

function getIPC(id = 0) {
  return new Promise((resolve, reject) => {
    const path = getIPCPath(id);
    const onerror = () => {
      if (id < 10) {
        resolve(getIPC(id + 1));
      } else {
        reject(new Error("Could not connect"));
      }
    };
    const sock = net.createConnection(path, () => {
      sock.removeListener("error", onerror);
      resolve(sock);
    });
    sock.once("error", onerror);
  });
}

function encode(op: number, data: any) {
  data = JSON.stringify(data);
  const len = Buffer.byteLength(data);
  const packet = Buffer.alloc(8 + len);
  packet.writeInt32LE(op, 0);
  packet.writeInt32LE(len, 4);
  packet.write(data, 8, len);
  return packet;
}

const working = {
  full: "",
  op: undefined,
};

function decode(socket: any, callback: any) {
  const packet = socket.read();
  if (!packet) {
    return;
  }

  let { op } = working;
  let raw;
  if (working.full === "") {
    op = working.op = packet.readInt32LE(0);
    const len = packet.readInt32LE(4);
    raw = packet.slice(8, len + 8);
  } else {
    raw = packet.toString();
  }

  try {
    const data = JSON.parse(working.full + raw);
    callback({ op, data }); // eslint-disable-line callback-return
    working.full = "";
    working.op = undefined;
  } catch (err) {
    working.full += raw;
  }

  decode(socket, callback);
}

class IPCTransport extends EventEmitter {
  client: any;
  socket: any;

  constructor(client: any) {
    super();
    this.client = client;
    this.socket = null;
  }

  async connect() {
    const socket: any = (this.socket = await getIPC());
    socket.on("close", this.onClose.bind(this));
    socket.on("error", this.onClose.bind(this));
    this.emit("open");
    socket.write(
      encode(OPCodes.HANDSHAKE, {
        v: 1,
        client_id: this.client.clientId,
      })
    );
    socket.pause();
    socket.on("readable", () => {
      decode(socket, ({ op, data }: { op: any, data: any}) => {
        switch (op) {
          case OPCodes.PING:
            this.send(data, OPCodes.PONG);
            break;
          case OPCodes.FRAME:
            if (!data) {
              return;
            }
            if (data.cmd === RPCCommands.AUTHORIZE && data.evt !== RPCEvents.ERROR) {
              // TODO: handle this
            }
            this.emit("message", data);
            break;
          case OPCodes.CLOSE:
            this.emit("close", data);
            break;
          default:
            break;
        }
      });
    });
  }

  onClose(e: any) {
    this.emit("close", e);
  }

  send(data: any, op = OPCodes.FRAME) {
    if (!this.socket) {
      return;
    }
    this.socket.write(encode(op, data));
  }

  async close() {
    if (!this.socket) {
      return;
    }

    return new Promise(r => {
      this.once("close", r);
      this.send({}, OPCodes.CLOSE);
      this.socket.end();
    });
  }

  ping() {
    if (!this.socket) {
      return;
    }

    this.send(uuid(), OPCodes.PING);
  }
}

export default IPCTransport;
