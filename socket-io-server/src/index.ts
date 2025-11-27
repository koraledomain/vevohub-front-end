import {Server} from "socket.io";
import {createServer} from "http";
import {Buffer} from "buffer";
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, Message} from "../types/types";

const httpServer = createServer();
const REQUIRE_AUTH = process.env.SOCKET_REQUIRE_AUTH !== "false";

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

// Langchain service URL
const LANGCHAIN_SERVICE_URL = process.env.LANGCHAIN_SERVICE_URL || "http://localhost:3001";

type JwtPayload = {
  exp?: number;
  [key: string]: any;
};

const decodeJwt = (token: string): JwtPayload => {
  const [, payload = ""] = token.split(".");
  const json = Buffer.from(payload, "base64").toString("utf8");
  return JSON.parse(json);
};

io.use((socket, next) => {
  const token = (socket.handshake.auth as {token?: string} | undefined)?.token;
  if (!token) {
    if (REQUIRE_AUTH) {
      return next(new Error("Missing auth token"));
    }
    console.warn(`Socket ${socket.id} connected without JWT (allowed by config).`);
    return next();
  }

  try {
    const payload = decodeJwt(token);
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      return next(new Error("Token expired"));
    }
    socket.data.auth = {
      token,
      userId: payload?.["user-id"]?.toString(),
    };
    return next();
  } catch (error) {
    console.error("Failed to decode JWT during socket handshake", error);
    if (REQUIRE_AUTH) {
      return next(new Error("Invalid auth token"));
    }
    return next();
  }
});

/**
 * Call the langchain service to get AI response
 */
async function getAIResponse(userMessage: string, authToken?: string): Promise<string> {
  try {
    const response = await fetch(`${LANGCHAIN_SERVICE_URL}/agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? {Authorization: `Bearer ${authToken}`} : {}),
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Langchain service error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.response || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error calling langchain service:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "Sorry, I encountered an error while processing your request.";
  }
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("sendMessage", async ({ text, token }) => {
    const trimmed = text?.trim();
    console.log("Received message from client:", trimmed);
    if (!trimmed) {
      return;
    }
    const effectiveToken = token ?? socket.data.auth?.token;
    
    // Create user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: trimmed,
      sender: "user",
      timestamp: new Date().toISOString(),
      avatar: undefined,
    };

    // Emit user message immediately
    socket.emit("newMessage", userMessage);

    // Get AI response from langchain service
    try {
      const aiResponseText = await getAIResponse(trimmed, effectiveToken);
      
      // Create AI response message
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: aiResponseText,
        sender: "system",
        timestamp: new Date().toISOString(),
        avatar: undefined,
      };

      // Emit AI response
      socket.emit("newMessage", aiMessage);
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "system",
        timestamp: new Date().toISOString(),
        avatar: undefined,
      };
      socket.emit("newMessage", errorMessage);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


const PORT = 4000;

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
