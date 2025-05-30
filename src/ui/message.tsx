import { processor } from "@/lib/md";
import type { ChatMessage } from "@/lib/types";
import { clsx } from "clsx";

export const Message = (props: {
	message: ChatMessage;
	transitionName?: string;
}) => {
	const { transitionName, message } = props;
	const { content, role } = message;
	const user = role === "user";

	return (
		<div class={clsx(user && "my-2 flex justify-end pl-8")}>
			<div
				class={clsx(
					"chat-bubble",
					user &&
						"bg-muted border-base-200 dark:border-base-800 w-fit rounded-md border p-3 px-4 wrap-break-word shadow-sm dark:shadow-black/75",
					!user && "py-8",
				)}
				style={transitionName && `view-transition-name: ${transitionName}`}
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
