import {createAgent} from "langchain";
import {ChatNvidia} from "./models/nvidia-chat";
import {callJavaAPI} from "./tools";

/**
 * Handles user input by processing it through the LangChain agent
 * @param userText - The user's message/query
 * @returns The agent's response
 */
export async function handleUserInput(userText: string): Promise<string> {
  try {
    console.log("[DEBUG] Starting handleUserInput with:", userText);
    
    // Initialize NVIDIA model with appropriate configuration
    console.log("[DEBUG] Creating ChatNvidia model...");
    const model = new ChatNvidia({
      model: "meta/llama-4-maverick-17b-128e-instruct",
      apiKey: process.env.NVIDIA_API_KEY || "",
      temperature: 0.7, // Balance between creativity and consistency
      maxTokens: 512,
    });

    // Create agent with model and tools
    console.log("[DEBUG] Creating agent...");
    const agent = createAgent({
      model,
      tools: [callJavaAPI],
    });

    // Invoke the agent with user message
    console.log("[DEBUG] Invoking agent...");
    const response = await agent.invoke({
      messages: [{role: "user", content: userText}],
    });
    console.log("[DEBUG] Agent response received");

    // Extract the response text from the agent's response
    // The response structure may vary, so we handle it safely
    if (typeof response === "string") {
      return response;
    }
    
    if (response?.messages && Array.isArray(response.messages)) {
      const lastMessage = response.messages[response.messages.length - 1];
      if (lastMessage?.content) {
        return String(lastMessage.content);
      }
    }

    // Fallback: stringify the response if it's an object
    return JSON.stringify(response);
  } catch (error) {
    console.error("Error in handleUserInput:", error);
    if (error instanceof Error) {
      return `Sorry, I encountered an error: ${error.message}`;
    }
    return "Sorry, I encountered an unexpected error while processing your request.";
  }
}
