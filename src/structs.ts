export type RelayRequestOpts = {
  socket: SocketIO.Socket;
  fileName: string;
};

export type RelayPayload = {
  requestId: string;
  fileName: string;
  data: string;
};
