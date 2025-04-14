import { escape } from "ovr";

export type MessageEntry = {
	index: number;
	message: { role: "user" | "assistant"; content: string };
};

export const Messages = (props: { messages: MessageEntry[] }) => {
	return (
		<>
			{props.messages.map((entry, i) => {
				if (i === props.messages.length - 1) {
					// scroll to here - form action /#m
					return (
						<div id="m">
							<Message md entry={entry} />
						</div>
					);
				}
				return <Message md entry={entry} />;
			})}
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
					class="bg-muted mt-12 h-32 border-none shadow-sm transition-shadow outline-none focus:shadow-md"
				></textarea>
			)}
		</div>
	);
};
