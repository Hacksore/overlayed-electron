import EventEmitter from "events";
import http from "http";
import log from "electron-log";

class AuthServer extends EventEmitter {
  private port = 61200;
  private app: http.Server;

  constructor() {
    super();

    // Create an instance of the http server to handle HTTP requests
    this.app = http.createServer(this.onRequest.bind(this));

    // Start the server on port 61200
    try {
      this.start();
    } catch (err) {
      // TODO: handle this error
      log.info("we can't bind");
    }
  }

  setHeaders(req: http.RequestOptions, res: any) {
    const allowedDomains = ["http://localhost:3000", "https://overlayed.dev"];

    // @ts-ignore
    const foundHost = allowedDomains.find(item => req?.headers?.origin?.includes(item));
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (foundHost) {
      headers["Access-Control-Allow-Origin"] = foundHost;
      headers["Access-Control-Request-Method"] = "POST";
      headers["Access-Control-Allow-Methods"] = "POST";
      headers["Access-Control-Allow-Headers"] = "*";
    }

    res.writeHead(200, headers);
  }

  onRequest(req: any, res: any) {
    this.setHeaders(req, res);

    if (req.url === "/auth" && req.method === "POST") {
      log.info("Got request from browser");
      const chunks: any = [];
      req.on("data", (chunk: any) => chunks.push(chunk));
      req.on("end", () => {
        const data: any = Buffer.concat(chunks);
        log.info("Sending token to electron via port", this.port);
        this.emit("token", JSON.parse(data.toString()));
        log.debug("Token", data.toString());

      });

      return res.end(
        JSON.stringify({
          message: "ok",
        })
      );
    }

    return res.end(
      JSON.stringify({
        error: "Could not auth",
      })
    );
  }

  start() {
    this.app.listen(this.port, "127.0.0.1");
  }

  close() {
    log.debug("Closing auth service");
    this.app.close();
  }
}

export default AuthServer;
