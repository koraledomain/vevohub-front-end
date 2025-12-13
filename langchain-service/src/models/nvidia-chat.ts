import { BaseChatModel, BaseChatModelCallOptions } from "@langchain/core/language_models/chat_models";
import { BaseMessage, AIMessage, ChatMessage } from "@langchain/core/messages";
import { ChatGeneration, ChatResult } from "@langchain/core/outputs";
import { StructuredToolInterface } from "@langchain/core/tools";

interface NvidiaChatModelParams {
  model?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Simple NVIDIA Chat Model wrapper for LangChain
 */
export class ChatNvidia extends BaseChatModel<BaseChatModelCallOptions> {
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  invokeUrl: string = "https://integrate.api.nvidia.com/v1/chat/completions";
  boundTools?: StructuredToolInterface[];

  constructor(params: NvidiaChatModelParams = {}) {
    super({});
    this.model = params.model || "meta/llama-4-maverick-17b-128e-instruct";
    this.apiKey = params.apiKey || process.env.NVIDIA_API_KEY || "";
    this.temperature = params.temperature ?? 0.7;
    this.maxTokens = params.maxTokens ?? 512;
  }

  _llmType(): string {
    return "nvidia";
  }

  _modelType(): string {
    return "nvidia";
  }

  /**
   * Convert LangChain messages to simple format
   */
  private _convertMessages(messages: BaseMessage[]): Array<{ role: string; content: string }> {
    return messages.map((msg) => {
      if (msg instanceof AIMessage) {
        return { role: "assistant", content: String(msg.content) };
      } else if (msg instanceof ChatMessage) {
        return { role: msg.role, content: String(msg.content) };
      } else {
        return { role: "user", content: String(msg.content) };
      }
    });
  }

  /**
   * Simple API call - just like the NVIDIA example
   */
  async _generate(
    messages: BaseMessage[],
    options?: BaseChatModelCallOptions
  ): Promise<ChatResult> {
    const nvidiaMessages = this._convertMessages(messages);

    const payload: any = {
      model: this.model,
      messages: nvidiaMessages,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stream: false,
    };

    // Add tools if bound (required for LangChain agents)
    if (this.boundTools && this.boundTools.length > 0) {
      payload.tools = this.boundTools.map((tool) => {
        const schema = tool.schema as any;
        return {
          type: "function",
          function: {
            name: tool.name,
            description: tool.description || "",
            parameters: schema || { type: "object", properties: {} },
          },
        };
      });
      // Try to force tool usage - some models need explicit tool_choice
      // Note: "required" might not be supported by all models, so we'll try "auto" first
      // If that doesn't work, we may need to detect tool mentions in text and call them manually
      payload.tool_choice = "auto";
      console.log(`[DEBUG] 📤 Using tool_choice: "auto" (model may not support "required")`);
      console.log(`[DEBUG] 📤 Sending ${this.boundTools.length} tools to NVIDIA API`);
      console.log(`[DEBUG] 📤 Tool names:`, this.boundTools.map(t => t.name).slice(0, 10).join(", "), this.boundTools.length > 10 ? `... (+${this.boundTools.length - 10} more)` : "");

      // Log getCurrentTenant tool specifically if it exists
      const getCurrentTenantTool = this.boundTools.find(t => t.name === 'getCurrentTenant');
      if (getCurrentTenantTool) {
        const schema = getCurrentTenantTool.schema as any;
        const toolPayload = payload.tools.find((t: any) => t.function.name === 'getCurrentTenant');
        console.log(`[DEBUG] 📤 getCurrentTenant tool payload:`, JSON.stringify(toolPayload, null, 2));
        console.log(`[DEBUG] 📤 getCurrentTenant schema:`, JSON.stringify(schema, null, 2));
      }

      // Log a sample tool to verify format
      if (this.boundTools.length > 0 && this.boundTools[0]) {
        const sampleTool = this.boundTools[0];
        const schema = sampleTool.schema as any;
        const toolPayload = payload.tools[0];
        console.log(`[DEBUG] 📤 Sample tool payload being sent:`, JSON.stringify(toolPayload, null, 2).substring(0, 500));
        console.log(`[DEBUG] 📤 Sample tool schema type:`, typeof schema, schema?.type, schema?.properties ? `has ${Object.keys(schema.properties).length} properties` : 'no properties');
      }
    } else {
      console.log("[WARN] ❌ No tools bound to model - agent may not be able to use tools!");
    }

    // Log the full payload (truncated) to see what we're sending
    console.log("[DEBUG] 📤 Payload summary:", {
      model: payload.model,
      messagesCount: payload.messages.length,
      toolsCount: payload.tools?.length || 0,
      tool_choice: payload.tool_choice,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens
    });

    console.log("[DEBUG] Making fetch request to NVIDIA API...");

    // Add timeout to prevent hanging when debugger is attached
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch(this.invokeUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log("[DEBUG] Fetch response received, status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Log full response for debugging
      console.log("[DEBUG] Full NVIDIA API response:", JSON.stringify(data, null, 2).substring(0, 1000));

      const message = data.choices?.[0]?.message || {};
      const content = message.content || "";

      // Handle tool calls if present
      const toolCalls = message.tool_calls || [];

      if (toolCalls.length > 0) {
        console.log(`[DEBUG] ✅ Model returned ${toolCalls.length} tool call(s):`);
        toolCalls.forEach((tc: any, idx: number) => {
          console.log(`[DEBUG] ✅ Tool call ${idx + 1}: ${tc.function?.name}`);
          console.log(`[DEBUG] ✅ Tool call ${idx + 1} args:`, tc.function?.arguments);
          console.log(`[DEBUG] ✅ Tool call ${idx + 1} id:`, tc.id);
        });
      } else {
        console.log("[DEBUG] ❌ No tool calls in model response!");
        console.log("[DEBUG] ❌ Response content:", content.substring(0, 500));
        console.log("[DEBUG] ❌ Full message object:", JSON.stringify(message, null, 2).substring(0, 1000));
      }

      const aiMessage = new AIMessage({
        content,
        tool_calls: toolCalls.map((tc: any) => ({
          name: tc.function?.name || "",
          args: JSON.parse(tc.function?.arguments || "{}"),
          id: tc.id || "",
        })),
      });

      return {
        generations: [
          {
            message: aiMessage,
            text: content,
          } as ChatGeneration,
        ],
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: The NVIDIA API request took too long (possibly due to debugger attachment)');
      }
      throw error;
    }
  }

  /**
   * Required for LangChain agents - bind tools to model
   */
  bindTools(tools: StructuredToolInterface[]): this {
    const newInstance = new ChatNvidia({
      model: this.model,
      apiKey: this.apiKey,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    });
    newInstance.boundTools = tools;
    return newInstance as this;
  }
}
