import { io } from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_SERVER_URL;

export const vendorSocket = io(BACKEND_URL, {
  autoConnect: false,
});
