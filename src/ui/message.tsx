import { Chart } from "./chart";
import { processor } from "@/lib/md";
import * as z from "@/lib/schema";
import type { AgentInputItem } from "@openai/agents-core";
import { clsx } from "clsx";
import type * as ai from "openai";

export const Message = (props: {
	input:
		| AgentInputItem
		| ai.OpenAI.Responses.ResponseOutputItem
		| ai.OpenAI.Responses.ResponseInputItem;
	index: number;
}) => {
	const { index, input } = props;

	if (!input.type) input.type = "message";

	if (input.type === "message") {
		const { content, role } = input;
		const user = role === "user";

		if (!content) return;

		return (
			<div class={clsx("pb-12", user && "flex justify-end pl-8")}>
				<div
					class={clsx(
						"my-trim",
						user &&
							"bg-muted border-base-200 dark:border-base-800 w-fit min-w-10.5 rounded-md border p-2 px-3 wrap-break-word shadow-xs dark:shadow-black/75",
					)}
					style={`view-transition-name: m-${index}`}
				>
					{processor.render(
						typeof content === "string"
							? content
							: content
									.map((c) => {
										if (c.type === "input_text" || c.type === "output_text") {
											return c.text;
										} else if (c.type === "input_image") {
											if ("image" in c) {
												return c.image;
											} else {
												return c.image_url ?? "Image";
											}
										} else if (c.type === "input_file") {
											if ("file" in c) {
												return c.file;
											} else {
												return c.filename ?? "File";
											}
										}

										return "";
									})
									.join("\n\n"),
					)}
				</div>
			</div>
		);
	} else if (input.type === "function_call_output") {
		try {
			const parsed = JSON.parse(input.output);
			const { data } = z.functionOutput().safeParse(parsed);

			if (data?.chartOptions) {
				return <Chart options={data.chartOptions} />;
			}
		} catch {
			// JSON parse error
		}
	} else if (input.type === "web_search_call") {
	}
};
