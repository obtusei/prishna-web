"use client";

import { useEffect, useState } from "react";
import { socket } from "@/socket";
import { authClient } from "@/lib/auth-client";

export default function Connection() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [userSession, setUseSession] = useState<any | null>();

  useEffect(() => {
    async function init() {
      const session = await authClient.getSession();
      const userId = session.data?.session.userId;
      console.log(`USER ID is ${userId}`);
      if (socket.connected) onConnect();

      function onConnect() {
        setIsConnected(true);
        setTransport(socket.io.engine.transport.name);

        // ✅ register user when connected
        if (userId) {
          console.log("User id exist so emitting it...");
          socket.emit("register", userId);
        }

        socket.io.engine.on("upgrade", (transport) => {
          setTransport(transport.name);
        });
      }

      function onDisconnect() {
        setIsConnected(false);
        setTransport("N/A");
      }

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      };
    }

    init();
  }, []);

  return (
    <div className=" bg-green-600 text-center text-sm p-1 text-white">
      <p>{isConnected ? "Connected" : "Disconnected"}</p>
    </div>
  );
}
