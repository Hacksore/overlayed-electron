import { EventEmitter } from "events";

class IPCSocketService extends EventEmitter {
  constructor() {
    super();

    window.electron.receive("fromMain", this.onMessage.bind(this));
  }

  onMessage(message: any) {
    this.emit("message", message);
  }

  // @ts-ignore
  on(event: "message", fnc: (msg: any) => void): this;


  // @ts-ignore
  removeAllListeners() {

  }
}

export default IPCSocketService;
