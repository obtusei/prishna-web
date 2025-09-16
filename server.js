import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
import { PrismaClient } from "./src/generated/prisma/index-browser.js";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  const onlineUsers = new Map();
  io.on("connection", (socket) => {
    console.log(`Socket id is ${socket.id}`);
    socket.on("register", (userId) => {
      console.log(`Registered user id ${userId} to ${socket.id}`);
      onlineUsers.set(userId, socket.id);
    });

    // socket.on("getMessages", async () => {
    //   const messages = await prisma.messages.findMany({
    //     orderBy: { createdAt: "asc" },
    //   });
    //   socket.emit("messages", messages);
    // });

    // socket.on("sendMessage", async (data) => {
    //   const msg = await prisma.message.create({
    //     data: {
    //       content: data.content,
    //       sender: data.sender,
    //     },
    //   });

    //   io.emit("newMessage", msg); // broadcast to everyone
    // });
    // Private message
    socket.on("sendPrivateMessage", async ({ sender, receiver, content }) => {
      // Save to DB
      // const msg = await prisma.message.create({
      //   data: {
      //     sender,
      //     content,
      //     // You can add a receiver field in Prisma schema
      //   },
      // });

      // Find receiver socket id
      console.log(`SENDER: ${sender}`);
      console.log(`RECEIVER: ${receiver}`);
      const receiverSocketId = onlineUsers.get(receiver);
      console.log(`RECEIVED SOCKET ID: ${receiverSocketId}`);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newPrivateMessage", {
          role: "SENDER",
          content: content,
        });
      }

      // Optionally also emit to sender so they see their own msg instantly
      socket.emit("newPrivateMessage", {
        role: "SESSION_USER",
        content: content,
      });
    });

    //
    // WebRTC signaling events
    //

    // Caller sends an offer -> forward to callee
    socket.on("call-user", ({ fromUserId, toUserId, offer }) => {
      const targetSocketId = onlineUsers.get(toUserId);
      console.log(
        `CALL USER, TARGET SOCKET for user ${toUserId} is ID:${targetSocketId}`
      );
      if (targetSocketId) {
        io.to(targetSocketId).emit("incoming-call", { fromUserId, offer });
      } else {
        socket.emit("user-unavailable", { toUserId });
      }
    });

    // Callee sends answer -> forward to caller
    socket.on("answer-call", ({ fromUserId, toUserId, answer }) => {
      const targetSocketId = onlineUsers.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-answered", { fromUserId, answer });
      }
    });

    // Exchange ICE candidates both ways
    socket.on("ice-candidate", ({ fromUserId, toUserId, candidate }) => {
      const targetSocketId = onlineUsers.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("ice-candidate", { fromUserId, candidate });
      }
    });

    // Caller or callee ends call
    socket.on("end-call", ({ fromUserId, toUserId }) => {
      const targetSocketId = onlineUsers.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("call-ended", { fromUserId });
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
