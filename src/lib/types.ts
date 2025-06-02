import type { OpenAI } from "openai";

export type ChatMessage =
	| OpenAI.Responses.ResponseOutputItem
	| OpenAI.Responses.ResponseInputItem;
