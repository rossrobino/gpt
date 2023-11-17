import type { ChatCompletionRole } from "openai/resources/chat";

export type Messages = Message[];

export type Message = {
	value: { role: ChatCompletionRole; content: string };
	open: boolean;
	edit: boolean;
};
