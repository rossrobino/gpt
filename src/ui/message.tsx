import { processor } from "@/lib/md";

export const Message = (props: {
	message: {
		role: "user" | "assistant" | "system" | "developer";
		content: string;
	};
	transitionName?: string;
}) => {
	const content = props.message.content;
	return (
		<div class={props.message.role === "user" ? "pl-16" : ""}>
			<div
				class={`chat-bubble ${props.message.role === "user" ? "bg-muted border-base-200 dark:border-base-800 rounded-md border p-3 px-4 wrap-break-word shadow-sm dark:shadow-black/75" : "py-8"}`}
				style={
					props.transitionName &&
					`view-transition-name: ${props.transitionName}`
				}
			>
				{processor.render(content)}
			</div>
		</div>
	);
};
