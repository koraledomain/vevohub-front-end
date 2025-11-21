import {tool} from "@langchain/core/tools";
import * as z from "zod";

// Zod schema for the tool input - this validates and provides type safety
const callJavaAPISchema = z.object({
  query: z
    .string()
    .min(1, "Query cannot be empty")
    .describe("The user's query or request to send to the Java backend API"),
});

// Infer TypeScript type from Zod schema
type CallJavaAPIInput = z.infer<typeof callJavaAPISchema>;

export const callJavaAPI = tool(
  async (input: unknown) => {
    try {
      // Validate input using Zod schema (runtime validation)
      // LangChain passes unknown input, we validate it with Zod
      const validatedInput = callJavaAPISchema.parse(input);
      
      const res = await fetch("http://localhost:8081/api/query", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({query: validatedInput.query}),
      });

      if (!res.ok) {
        throw new Error(`Java API returned error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      return JSON.stringify(data);
    } catch (error) {
      // Handle validation errors and API errors
      if (error instanceof z.ZodError) {
        return `Validation error: ${error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
      }
      if (error instanceof Error) {
        return `Error calling Java API: ${error.message}`;
      }
      return `Unknown error occurred while calling Java API`;
    }
  },
  {
    name: "call_java_api",
    description: "Queries the Java backend REST API for data or to perform actions. Use this when you need to interact with the backend system, retrieve information, or execute operations on the database.",
    // Convert Zod schema to JSON schema format for LangChain
    schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The user's query or request to send to the Java backend API",
        },
      },
      required: ["query"],
    },
  }
);
