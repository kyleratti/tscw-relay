import { performance } from "perf_hooks";
import { RelayPayload, RelayRequestOpts } from "./structs";

export default class RelayRequest {
  private socket: SocketIO.Socket;
  private fileName: string;

  constructor(opts: RelayRequestOpts) {
    this.socket = opts.socket;
    this.fileName = opts.fileName;
  }

  private getTimestamp = () => performance.now();

  send = () => {
    return new Promise<RelayPayload>((success, fail) => {
      const requestId = `${this.getTimestamp()}_${this.fileName}`;

      console.debug(
        `Proxying socket request #${requestId} for "${this.fileName}"`
      );

      this.socket.on("relayResponse.success", (payload: RelayPayload) => {
        success(payload);
      });

      this.socket.on("relayResponse.fail", err => {
        fail(err);
      });

      this.socket.on("error", err => fail);

      this.socket.emit("relayRequest", {
        requestId: requestId,
        fileName: this.fileName
      });
    });
  };
}
