import {createAgent} from "langchain";
import {callJavaAPI} from "./tools";
import {ChatOpenAI} from "@langchain/openai";

export async function handleUserInput(userText: string) {
  const model = new ChatOpenAI({model: "gpt-4-turbo", temperature: 0.7});

  const agent = createAgent({
    model,
    tools: [callJavaAPI],
  });

  return await agent.invoke({messages: [{role: "user", content: userText}]});
}
