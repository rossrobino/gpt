import type * as schema from "@/lib/schema";
import type { OpenAI } from "openai";

export type ChatMessage =
	| OpenAI.Responses.ResponseOutputItem
	| OpenAI.Responses.ResponseInputItem;

export type Dataset = schema.infer<typeof schema.DataSchema> | null;
