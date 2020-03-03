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

  start = () => {
    this.server.listen(port, () => {
      console.log(`Listening for HTTP requests on http://127.0.0.1:${port}`);
    });

    this.io.on("connect", socket => {
      console.log(`Client connected`);

      socket.on("message", msg => {
        console.debug(`Received message`, msg);
      });

      socket.on("disconnect", () => {
        console.debug(`Client disconnected`);
      });
    });

    this.app.get("/:fileName.xml", async (req, res) => {
      const fileName = req.params.fileName;
      const fullFileName = `${fileName}.xml`;
      const clients = this.io.sockets.sockets;
      const numClients = Object.keys(clients).length;

      if (!clients || numClients <= 0)
        return res.status(HttpStatusCodes.SERVICE_UNAVAILABLE).json({
          error: `StatCrew client unavailable (is the Stat Crew VM connected to the relay?)`
        });

      if (numClients > 1)
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
          error: `StatCrew clients > 1 (too many StatCrew listeners)`
        });

      const client = clients[Object.keys(clients)[0]];

      const relayReq = new RelayRequest({
        socket: client,
        fileName: fullFileName
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
          error: e
        });
      }
    });
  };
}
