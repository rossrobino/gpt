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
		const system = role === "system";
		const assistant = role === "assistant";

		if (!content) return;

		return (
			<div class={clsx("flex pb-12", !assistant && "justify-end")}>
				<div
					class={clsx(
						"my-trim",
						user &&
							"bg-muted border-secondary chat-bubble w-fit min-w-10.5 rounded-md border px-3 py-2 shadow-xs",
						system && "text-muted-foreground w-full",
					)}
					style={`view-transition-name: m-${index}`}
				>
					{processor.generate(
						(function* () {
							if (typeof content === "string") yield content;
							else {
								for (const c of content) {
									if (c.type === "input_text" || c.type === "output_text") {
										yield c.text;
									} else if (c.type === "input_image") {
										if ("image" in c) {
											const { image } = c;
											if (typeof image === "string") {
												yield image;
											} else {
												yield image.id;
											}
										} else {
											yield c.image_url ?? "Image";
										}
									} else if (c.type === "input_file") {
										if ("file" in c) {
											const { file } = c;
											if (typeof file === "string") {
												yield file;
											} else {
												yield file.id;
											}
										} else {
											yield c.filename ?? "File";
										}
									}

									yield "\n\n";
								}
							}
						})(),
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
