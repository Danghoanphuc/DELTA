import { Server } from "socket.io";
import { type Server as HttpServer } from "http";

let io: Server;

const socketService = {
  initialize: (httpServer: HttpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "*", // You might want to restrict this in production
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  },
  getIo: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};

export { socketService, io };
