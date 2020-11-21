import express from "express";
import http from "http";
import HttpStatusCodes from "http-status-codes";
import socketIo from "socket.io";
import RelayRequest from "./relayrequest";

const port = 2469;

export default class SocketServer {
  private app = express();
  private server = http.createServer(this.app);
  private io = socketIo(this.server);

  private get clients(): { [id: string]: socketIo.Socket } {
    return this.io.sockets.sockets;
  }

  private get numClients(): Number {
    return Object.keys(this.clients).length;
  }

  private noClientsMiddleware = (_req, res, next: Function) => {
    if (!this.clients || this.numClients <= 0)
      return res.status(HttpStatusCodes.SERVICE_UNAVAILABLE).json({
        error: `StatCrew client unavailable (is the Stat Crew VM connected to the relay?)`,
      });

    next();
  };

  private tooManyClientsMiddleware = (_req, res, next: Function) => {
    if (this.numClients > 1)
      return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
        error: `StatCrew clients > 1 (too many StatCrew listeners)`,
      });

    next();
  };

  start = () => {
    this.server.listen(port, () => {
      console.log(`Listening for HTTP requests on http://127.0.0.1:${port}`);
    });

    this.io.on("connect", (socket) => {
      console.log(`Client connected`);

      socket.on("message", (msg) => {
        console.debug(`Received message`, msg);
      });

      socket.on("disconnect", () => {
        console.debug(`Client disconnected`);
      });
    });

    this.app.get(
      "/status",
      this.noClientsMiddleware,
      this.tooManyClientsMiddleware,
      (_req, res) => {
        return res.status(HttpStatusCodes.OK).json({
          message: "OK",
          client: this.clients[0],
        });
      }
    );

    this.app.get(
      "/:fileName.xml",
      this.noClientsMiddleware,
      this.tooManyClientsMiddleware,
      async (req, res) => {
        const fileName = req.params.fileName;
        const fullFileName = `${fileName}.xml`;

        const client = this.clients[Object.keys(this.clients)[0]];

        const relayReq = new RelayRequest({
          socket: client,
          fileName: fullFileName,
        });

        try {
          const payload = await relayReq.send();

          return res
            .status(HttpStatusCodes.OK)
            .contentType(".xml")
            .send(payload.data);
        } catch (e) {
          console.error(e);

          return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: e,
          });
        }
      }
    );
  };
}
