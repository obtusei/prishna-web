"use client";

import { io } from "socket.io-client";

export const socket = io(
  // adapt URL if server runs on other origin/port
  typeof window !== "undefined"
    ? "http://localhost:4000"
    : "http://localhost:4000",
  {
    autoConnect: true,
    transports: ["websocket", "polling"],
  }
);
