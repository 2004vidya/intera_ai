import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage ,AIMessage,tool,createAgent} from "langchain";
import { ChatMistralAI } from "@langchain/mistralai";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";
import redis from "../config/redis.js";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  streaming:true
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

export function getCacheKey(query) {
  return "chat:" + query.trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "_");
}

export async function generateResponse(messages) {
  const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
  if (!lastMessage) {
    return "";
  }
  const query = lastMessage.content || "";
  const key = getCacheKey(query);

  const cached = await redis.get(key);

  if (cached) {
     console.log("✅ Cache Hit");
    return cached;
  }

  console.log("❌ Cache Miss");

  const response = await agent.invoke({
    messages: messages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "ai") {
        return new AIMessage(msg.content);
      } else {
        return new SystemMessage(msg.content);
      }
    })
  });

  const replyText = response.messages[response.messages.length - 1].text;

  await redis.set(key, replyText, "EX", 3600);

  return replyText;
}

const searchInternetTool = tool(
  searchInternet,
  {
    name:"search_internet",
    description:"Search the internet for latest information",
    schema:z.object({
      query:z.string().describe("The query to search for")
    })
  }
)

export const agent = createAgent({
  model:geminiModel,
  tools:[searchInternetTool],
  systemMessage:"You are a helpful assistant that answers questions using the tools provided.If you need to search for up-to-date information on the internet, use the search_internet tool. If you have the answer in your knowledge base, use it."
})

export async function generateTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for the chat conversations.
      User will provide you with first message of chat conversation and you will generate a title for that conversation in less than 2-4 words. The title should be clear,relevant and engaging giving user a quick understanding of the conversation.
      `),
      new HumanMessage(`
        Generate a title for a chat conversation based on following first message: "${message}"`)
  ]);
  return response.text;
}
