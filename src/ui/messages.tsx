import { escape } from "@robino/html";

export type MessageEntry = {
	index: number;
	message: {
		role: "user" | "assistant";
		content: string;
	};
};

export const Messages = (props: { messages: MessageEntry[] }) => {
	return (
		<>
			{props.messages.map((entry) => (
				<Message md entry={entry} />
			))}
		</>
	);
};

export const Message = (props: { md?: boolean; entry: MessageEntry }) => {
	return (
		<div class={props.entry.message.role === "user" && props.md ? "pl-16" : ""}>
			{props.md ? (
				<>
					<input
						hidden
						name={`content-${props.entry.index}`}
						value={escape(props.entry.message.content, true)}
					></input>

					<div
						class={`chat-bubble ${props.entry.message.role === "user" ? "bg-muted rounded-md p-3 px-4 shadow" : "py-8"}`}
						style={`view-transition-name: content-${props.entry.index}`}
					>
						{props.entry.message.content}
					</div>
				</>
			) : (
				<textarea
					name={`content-${props.entry.index}`}
					placeholder="Ask anything"
					style="view-transition-name: textarea"
					class="mt-12 h-32 shadow-sm outline-none"
					required
				></textarea>
			)}
		</div>
	);
};
