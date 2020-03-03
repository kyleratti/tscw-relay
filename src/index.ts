import SocketServer from "./socketserver";

const run = () => {
  const server = new SocketServer();
  server.start();
};

run();
