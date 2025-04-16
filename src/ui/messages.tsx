import { processor } from "@/lib/md";
import { Details } from "@/ui/details";
import { escape } from "ovr";

export type MessageEntry = {
	index: number;
	message: { role: "user" | "assistant"; content: string };
};

export const Messages = (props: { messages: MessageEntry[] }) => {
	return (
		<>
			{props.messages.length > 1 && (
				<Details label="Past messages">
					{props.messages.slice(0, -1).map((entry) => (
						<Message md entry={entry} />
					))}
				</Details>
			)}

			<Message md entry={props.messages.at(-1)!} />
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
						name="content"
						value={escape(props.entry.message.content, true)}
					></input>

					<div
						class={`chat-bubble ${props.entry.message.role === "user" ? "bg-muted border-base-200 dark:border-base-800 rounded-md border p-3 px-4 shadow-sm dark:shadow-black/75" : "py-8"}`}
					>
						{processor.render(props.entry.message.content)}
					</div>
				</>
			) : (
				<textarea
					name="content"
					placeholder="Ask anything"
					style="view-transition-name: textarea"
					class="bg-muted border-base-200 dark:border-base-800 mt-12 h-32 border shadow-sm transition outline-none focus:shadow-md dark:shadow-black/75"
				></textarea>
			)}
		</div>
	);
};
