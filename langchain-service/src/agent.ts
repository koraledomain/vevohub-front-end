import { traceable } from "langsmith/traceable";
import { createAgent } from "langchain";
import { ChatNvidia } from "./models/nvidia-chat";
import { createToolsFromOpenAPI } from "./tools/index";

type HandleUserInputOptions = {
  authToken?: string | undefined;
};

/**
 * Handles user input by processing it through the LangChain agent
 * @param userText - The user's message/query
 * @param options - Per-request context (e.g., auth token for downstream tools)
 * @returns The agent's response
 */
export const handleUserInput = traceable(
  async (userText: string, options: HandleUserInputOptions = {}): Promise<string> => {
    try {
      console.log("[DEBUG] Starting handleUserInput with:", userText);
      const { authToken } = options;

      console.log("[DEBUG] Creating ChatNvidia model...");
      const model = new ChatNvidia({
        model: "meta/llama-4-maverick-17b-128e-instruct",
        apiKey: process.env.NVIDIA_API_KEY || "",
        temperature: 0.7, // Balance between creativity and consistency
        maxTokens: 512,
      });

      // Generate all tools from OpenAPI spec
      console.log("[DEBUG] Generating tools from OpenAPI spec...");
      const tools = createToolsFromOpenAPI(authToken);
      console.log(`[DEBUG] Generated ${tools.length} tools from OpenAPI spec`);

      const agent = createAgent({
        model,
        tools,
      });

      console.log("[DEBUG] Invoking agent...");
      const response = await agent.invoke({
        messages: [{ role: "user", content: userText }],
      });
      console.log("[DEBUG] Agent response received");

      if (typeof response === "string") {
        return response;
      }

      if (response?.messages && Array.isArray(response.messages)) {
        const lastMessage = response.messages[response.messages.length - 1];
        if (lastMessage?.content) {
          return String(lastMessage.content);
        }
      }

      return JSON.stringify(response);
    } catch (error) {
      console.error("Error in handleUserInput:", error);
      if (error instanceof Error) {
        return `Sorry, I encountered an error: ${error.message}`;
      }
      return "Sorry, I encountered an unexpected error while processing your request.";
    }
  },
  { run_type: "chain", name: "handleUserInput" }
);
