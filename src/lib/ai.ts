import { OpenAI } from "openai";

export const openai = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export const models = ["gpt-4.1-nano", "gpt-4.1-mini", "gpt-4.1"];
export const defaultModel = models[0]!;
