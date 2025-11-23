import { io } from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_SERVER_URL;

export const customerSocket = io(BACKEND_URL, {
  autoConnect: true,
  transports: ["websocket"],
});
