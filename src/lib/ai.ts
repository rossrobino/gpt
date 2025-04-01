import { OpenAI } from "openai";

export const openai = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export const models = ["gpt-4o", "o3-mini"];

export const defaultModel = "gpt-4o";
