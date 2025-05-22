import type {
	ResponseInputMessageItem,
	ResponseOutputMessage,
} from "openai/resources/responses/responses.mjs";

export type ChatMessage = Omit<
	ResponseInputMessageItem | ResponseOutputMessage,
	"id"
>;
