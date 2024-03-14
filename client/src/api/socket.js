import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_APP_SERVER_URL

export const socket = io(BACKEND_URL);