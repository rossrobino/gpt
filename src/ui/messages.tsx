import { processor } from "@/lib/md";
import { Details } from "@/ui/details";

export type MessageEntry = {
	role: "user" | "assistant" | "system" | "developer";
	content: string;
};

export const Messages = (props: { messages: MessageEntry[] }) => {
	return (
		<Details summary="Previous messages">
			{props.messages.map((entry) => (
				<Message md message={entry} />
			))}
		</Details>
	);
};

export const Message = (props: { md?: boolean; message: MessageEntry }) => {
	const content = props.message.content;
	return (
		<div class={props.message.role === "user" && props.md ? "pl-16" : ""}>
			{props.md ? (
				<div
					class={`chat-bubble ${props.message.role === "user" ? "bg-muted border-base-200 dark:border-base-800 rounded-md border p-3 px-4 wrap-break-word shadow-sm dark:shadow-black/75" : "py-8"}`}
				>
					{processor.render(content)}
				</div>
			) : (
				<textarea
					tabindex={1}
					name="message"
					placeholder="Ask anything"
					class="bg-muted border-base-200 dark:border-base-800 mt-12 h-32 border shadow-sm transition outline-none focus:shadow-md dark:shadow-black/75"
				></textarea>
			)}
		</div>
	);
};
