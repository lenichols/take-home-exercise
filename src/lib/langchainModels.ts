import { ChatFireworks } from "@langchain/community/chat_models/fireworks";

export const getLLM = (model?: string) => {
    return new ChatFireworks({
      modelName: "accounts/fireworks/models/llama-v3p1-8b-instruct",
      temperature: 0.7,
      maxRetries: 3,
      apiKey: process.env.FIREWORKS_API_KEY,
    });
  // throw new Error("Unsupported model");
};
