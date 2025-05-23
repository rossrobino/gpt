import { processor } from "@/lib/md";
import type { ChatMessage } from "@/lib/types";

export const Message = (props: {
	message: ChatMessage;
	transitionName?: string;
}) => {
	const { content, role } = props.message;
	const user = role === "user";

	return (
		<div class={user ? "pl-16" : ""}>
			<div
				class={`chat-bubble ${user ? "bg-muted border-base-200 dark:border-base-800 rounded-md border p-3 px-4 wrap-break-word shadow-sm dark:shadow-black/75" : "py-8"}`}
				style={
					props.transitionName &&
					`view-transition-name: ${props.transitionName}`
				}
			>
				{processor.render(
					content
						.map((c) => {
							if (c.type === "input_text" || c.type === "output_text") {
								return c.text;
							} else if (c.type === "input_image") {
								return c.image_url ?? "Image";
							} else if (c.type === "input_file") {
								return c.filename ?? "File";
							}

							return "";
						})
						.join("\n\n"),
				)}
			</div>
		</div>
	);
};
