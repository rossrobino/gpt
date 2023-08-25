import type { ChatCompletionMessage } from "openai/resources/chat";

export type Messages = Message[];

export type Message = {
	value: ChatCompletionMessage;
	open: boolean;
	edit: boolean;
};
