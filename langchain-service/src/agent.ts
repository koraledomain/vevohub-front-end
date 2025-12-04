import { traceable } from "langsmith/traceable";
import { createAgent } from "langchain";
import { ChatNvidia } from "./models/nvidia-chat";
import { createToolsFromOpenAPI } from "./tools/index";
import { SystemMessage } from "@langchain/core/messages";

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
        temperature: 0.3, // Lower temperature for more focused, tool-using behavior
        maxTokens: 512,
      });

      // Generate all tools from OpenAPI spec
      console.log("[DEBUG] Generating tools from OpenAPI spec...");
      if (authToken) {
        console.log("[DEBUG] Auth token available for tools:", authToken.substring(0, 20) + "...");
      } else {
        console.log("[WARN] No auth token provided - API calls may fail if authentication is required");
      }
      const tools = createToolsFromOpenAPI(authToken);
      console.log(`[DEBUG] Generated ${tools.length} tools from OpenAPI spec`);

      const agent = createAgent({
        model,
        tools,
      });

      // System prompt to ensure agent uses REST API tools
      const systemPrompt = `You are an AI assistant that helps users interact with a REST API. 
IMPORTANT: When users ask questions or request actions, you MUST use the available REST API tools to fetch data or perform operations. 
DO NOT provide general explanations or theoretical answers. Instead, USE THE TOOLS to get real data from the API.

Rules:
1. Always use the appropriate tool from the available tools list to answer user queries
2. If a user asks about data (users, candidates, tenants, etc.), use the corresponding GET tool
3. If a user wants to create/update/delete something, use the corresponding POST/PUT/PATCH/DELETE tool
4. Only provide explanations if the tool execution fails or if explicitly asked for conceptual information
5. When you receive data from tools, present it clearly to the user
6. If you need a tenant ID and the user says "current tenant", you may need to use getCurrentTenant tool first

Your primary job is to execute API calls using the available tools, not to explain how APIs work.`;

      console.log("[DEBUG] Invoking agent...");
      const response = await agent.invoke({
        messages: [
          new SystemMessage(systemPrompt),
          { role: "user", content: userText },
        ],
      });
      console.log("[DEBUG] Agent response received");

      // Debug: Check if response contains tool calls or tool results
      console.log("[DEBUG] 📋 Full agent response structure:");
      let hasActualToolCalls = false;

      if (response?.messages && Array.isArray(response.messages)) {
        response.messages.forEach((msg: any, idx: number) => {
          console.log(`[DEBUG] 📋 Message ${idx}:`, {
            type: msg.constructor?.name || typeof msg,
            hasToolCalls: !!msg.tool_calls,
            toolCallsCount: msg.tool_calls?.length || 0,
            isToolResult: !!msg.name,
            toolName: msg.name || "N/A",
            contentPreview: String(msg.content || "").substring(0, 100)
          });

          if (msg.tool_calls && msg.tool_calls.length > 0) {
            hasActualToolCalls = true;
            console.log(`[DEBUG] ✅ Message ${idx} contains ${msg.tool_calls.length} tool call(s):`);
            msg.tool_calls.forEach((tc: any, tcIdx: number) => {
              console.log(`[DEBUG] ✅   Tool call ${tcIdx + 1}: ${tc.name} with args:`, JSON.stringify(tc.args, null, 2));
            });
          }
          if (msg.name) {
            console.log(`[DEBUG] 🔧 Message ${idx} is tool result from: ${msg.name}`);
          }
        });
      } else {
        console.log("[DEBUG] ❌ Response is not in expected format:", typeof response);
      }

      // FALLBACK: If no tool calls were made but model mentions a tool, call it manually
      if (!hasActualToolCalls && response?.messages && Array.isArray(response.messages)) {
        const lastMessage = response.messages[response.messages.length - 1];
        const content = String(lastMessage?.content || "");

        // Extract tool name from text (look for patterns like "getCurrentTenant", "use the `toolName` tool", etc.)
        const toolNamePattern = /(?:use|using|call|execute|run|will use)[\s]*[`'"]?(\w+)[`'"]?[\s]*(?:tool|function|endpoint|api)/i;
        const backtickPattern = /`(\w+)`/g;

        let detectedToolName: string | undefined = undefined;

        // Get all available tool names for matching
        const availableToolNames = tools.map(t => t.name);
        console.log(`[DEBUG] 🔍 FALLBACK: Available tools: ${availableToolNames.slice(0, 5).join(", ")}...`);

        // Try to find tool name in various patterns
        const match = content.match(toolNamePattern);
        if (match && match[1]) {
          const potentialTool = match[1];
          if (availableToolNames.includes(potentialTool)) {
            detectedToolName = potentialTool;
            console.log(`[DEBUG] 🔍 FALLBACK: Found tool via pattern match: "${potentialTool}"`);
          }
        }

        // If not found, try backtick pattern
        if (!detectedToolName) {
          const backtickMatches = Array.from(content.matchAll(backtickPattern));
          for (const backtickMatch of backtickMatches) {
            const potentialTool = backtickMatch[1];
            if (potentialTool && availableToolNames.includes(potentialTool)) {
              detectedToolName = potentialTool;
              console.log(`[DEBUG] 🔍 FALLBACK: Found tool via backtick match: "${potentialTool}"`);
              break;
            }
          }
        }

        // Last resort: check if any tool name appears in the content
        if (!detectedToolName) {
          for (const toolName of availableToolNames) {
            // Look for tool name as a word boundary (not part of another word)
            // Escape special regex characters in tool name
            const escapedToolName = toolName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const toolRegex = new RegExp(`\\b${escapedToolName}\\b`, 'i');
            if (toolRegex.test(content)) {
              detectedToolName = toolName;
              console.log(`[DEBUG] 🔍 FALLBACK: Found tool via word boundary match: "${toolName}"`);
              break;
            }
          }
        }

        if (detectedToolName) {
          console.log(`[DEBUG] 🔄 FALLBACK: Detected tool mention "${detectedToolName}" in text, calling it manually...`);

          const tool = tools.find(t => t.name === detectedToolName);
          if (tool) {
            try {
              // Call the tool with empty args (for tools like getCurrentTenant that need no params)
              const toolResult = await tool.invoke({});
              console.log(`[DEBUG] ✅ FALLBACK: Tool "${detectedToolName}" executed successfully`);

              // Parse the result and format it nicely
              let parsedResult;
              try {
                parsedResult = JSON.parse(toolResult);
              } catch {
                parsedResult = toolResult;
              }

              return `I've retrieved the current tenant information:\n\n${JSON.stringify(parsedResult, null, 2)}`;
            } catch (toolError) {
              console.error(`[DEBUG] ❌ FALLBACK: Error calling tool "${detectedToolName}":`, toolError);
              return `I tried to call the ${detectedToolName} tool, but encountered an error: ${toolError instanceof Error ? toolError.message : String(toolError)}`;
            }
          } else {
            console.log(`[DEBUG] ⚠️ FALLBACK: Tool "${detectedToolName}" not found in available tools`);
          }
        }
      }

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
