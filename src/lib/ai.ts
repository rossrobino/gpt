import { OpenAI } from "openai";

export const openai = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export type Model = { name: string; web?: boolean; reasoning?: boolean };

export const models: Model[] = [
	{ name: "gpt-4.1", web: true },
	{ name: "gpt-4.1-mini", web: true },
	{ name: "gpt-4.1-nano" },
	{ name: "o3-mini", reasoning: true },
];

export const defaultModel = models[1]!;
