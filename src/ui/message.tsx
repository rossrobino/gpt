import { processor } from "@/lib/md";
import { toCodeBlock } from "@/lib/md/to-code-block";
import type { ChatMessage } from "@/lib/types";
import { clsx } from "clsx";

export const Message = (props: {
	message: ChatMessage;
	transitionName?: string;
}) => {
	const { transitionName, message } = props;

	if (message.type === "message") {
		const { content, role } = message;
		const user = role === "user";

		return (
			<div class={clsx(user && "flex justify-end pl-8")}>
				<div
					class={clsx(
						"chat-bubble my-6",
						user &&
							"bg-muted border-base-200 dark:border-base-800 w-fit rounded-md border p-3 px-4 wrap-break-word shadow-sm dark:shadow-black/75",
					)}
					style={transitionName && `view-transition-name: ${transitionName}`}
				>
					{processor.render(
						typeof content === "string"
							? content
							: content
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
	} else if (message.type === "function_call_output") {
		return processor.render(
			toCodeBlock(
				"function",
				JSON.stringify(JSON.parse(message.output), null, 4),
			),
		);
	}
};
