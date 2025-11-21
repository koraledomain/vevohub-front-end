import {tool} from "@langchain/core/tools";
import * as z from "zod";

export const callJavaAPI = tool(
  async ({query}: { query: string }) => {
    // Use native fetch or node-fetch
    const res = await fetch("http://localhost:8081/api/query", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({query}),
    });
    const data = await res.json();
    return data;
  },
  {
    name: "call_java_api",
    description: "Queries the Java backend for given input",
    schema: z.object({
      query: z.string().describe("User input query to backend")
    }),
  }
);
