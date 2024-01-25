import type { ChatCompletionRole } from "openai/resources/index.mjs";

export type Messages = Message[];

export type Message = {
	value: { role: ChatCompletionRole; content: string };
	open: boolean;
	edit: boolean;
};
