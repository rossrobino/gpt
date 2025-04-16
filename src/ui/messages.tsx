import { processor } from "@/lib/md";
import { Details } from "@/ui/details";
import { escape } from "ovr";

export type MessageEntry = {
	index: number;
	message: { role: "user" | "assistant"; content: string };
};

export const Messages = (props: { messages: MessageEntry[] }) => {
	return (
		<Details summary="Previous messages">
			{props.messages.map((entry) => (
				<Message md entry={entry} />
			))}
		</Details>
	);
};

export const Message = (props: { md?: boolean; entry: MessageEntry }) => {
	const content = props.entry.message.content;
	return (
		<div class={props.entry.message.role === "user" && props.md ? "pl-16" : ""}>
			{props.md ? (
				<>
					<input hidden name="content" value={escape(content, true)}></input>

					<div
						class={`chat-bubble ${props.entry.message.role === "user" ? "bg-muted border-base-200 dark:border-base-800 rounded-md border p-3 px-4 wrap-break-word shadow-sm dark:shadow-black/75" : "py-8"}`}
						style={`view-transition-name: content-${props.entry.index}`}
					>
						{processor.render(content)}
					</div>
				</>
			) : (
				<textarea
					tabindex={1}
					name="content"
					placeholder="Ask anything"
					style={`view-transition-name: content-${props.entry.index}`}
					class="bg-muted border-base-200 dark:border-base-800 mt-12 h-32 border shadow-sm transition outline-none focus:shadow-md dark:shadow-black/75"
				></textarea>
			)}
		</div>
	);
};
