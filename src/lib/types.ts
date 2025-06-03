import type * as schema from "@/lib/schema";
import type * as ai from "openai";

export type ChatMessage =
	| ai.OpenAI.Responses.ResponseOutputItem
	| ai.OpenAI.Responses.ResponseInputItem;

export type Dataset = schema.infer<typeof schema.DataSchema> | null;
