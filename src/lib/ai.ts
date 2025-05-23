import "dotenv/config";
import { OpenAI } from "openai";

if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set.");

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type Model = { name: string; web?: boolean; reasoning?: boolean };

export const models: Model[] = [
	{ name: "gpt-4.1-nano" },
	{ name: "gpt-4.1-mini", web: true },
	{ name: "gpt-4.1", web: true },
	{ name: "o4-mini", reasoning: true },
];

export const defaultModel = models[0]!;
export const fastestModel = models[0]!;
