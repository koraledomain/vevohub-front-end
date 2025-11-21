import 'dotenv/config';
import express from "express";
import cors from "cors";
import {handleUserInput} from "./agent";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Enable CORS for Socket.IO server
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({status: "ok", service: "langchain-service"});
});

// Main agent endpoint
app.post("/agent", async (req, res) => {
  try {
    const {message} = req.body;

    // Validate request body
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Invalid request. 'message' field is required and must be a string.",
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        error: "Message cannot be empty.",
      });
    }

    // Process the message through the agent
    const response = await handleUserInput(message);

    // Return the AI response
    res.json({
      response,
    });
  } catch (error) {
    console.error("Error in /agent endpoint:", error);
    res.status(500).json({
      error: "Internal server error while processing your request.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`LangChain service running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Agent endpoint: http://localhost:${PORT}/agent`);
});

