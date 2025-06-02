import type * as schema from "@/lib/schema";
import type { OpenAI } from "openai";
import type * as z from "zod/v4";

export type ChatMessage =
	| OpenAI.Responses.ResponseOutputItem
	| OpenAI.Responses.ResponseInputItem;

export type Dataset = z.infer<typeof schema.DataSchema> | null;
