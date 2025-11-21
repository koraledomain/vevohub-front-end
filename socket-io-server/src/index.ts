import {Server} from "socket.io";
import {createServer} from "http";
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, Message} from "../types/types";


const httpServer = createServer();

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
   console.log("Client connected:", socket.id);

    // --- All socket event listeners should be defined here ---

    // server → client events (emitted immediately on connection)
    socket.emit("noArg");
    socket.emit("basicEmit", 1, "hello", Buffer.from([3]));
    socket.emit("withAck", 1, "test", Buffer.from([42]));

    socket.on("sendMessage", (text) => {
      console.log("I AM HERE DID I SENT A MESSAGE. Received text:", text);
      const message: Message = {
        id: crypto.randomUUID(),
        text,
        sender: "user",        // or choose logic later
        timestamp: new Date().toISOString(),
        avatar: undefined,
      };

      io.emit("newMessage", message);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

  });


const PORT = 4000;

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
