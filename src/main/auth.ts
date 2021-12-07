import EventEmitter from "events";
import http from "http";

class AuthServer extends EventEmitter {
  private port = 61200;
  private app: http.Server;

  constructor() {
    super();

    // Create an instance of the http server to handle HTTP requests
    this.app = http.createServer(this.onRequest.bind(this));

    // Start the server on port 3000
    this.app.listen(this.port, "127.0.0.1");
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
      const chunks: any = [];
      req.on("data", (chunk: any) => chunks.push(chunk));
      req.on("end", () => {
        const data: any = Buffer.concat(chunks);
        this.emit("token", JSON.parse(data.toString()));
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
}

export default AuthServer;
