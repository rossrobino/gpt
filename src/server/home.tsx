import instructions from "@/content/instructions.md?raw";
import * as ai from "@/lib/ai";
import { generateTitle } from "@/lib/generate-title";
import { processor } from "@/lib/md";
import { render } from "@/lib/render";
import { Controls } from "@/ui/controls";
import { Input } from "@/ui/input";
import { Message } from "@/ui/message";
import { PastMessages } from "@/ui/past-messages";
import { time } from "build:time";
import type {
	ResponseInput,
	ResponseInputContent,
} from "openai/resources/responses/responses.mjs";
import { Action, Page } from "ovr";
import { escape } from "ovr";
import { z } from "zod";

export const page = new Page("/", (c) => {
	// best to not prerender to prevent cold start, at least etag
	if (c.etag(time) && import.meta.env.PROD) return;

	c.head(<title>New Message</title>);

	return (
		<>
			<Input index={0} />
			<Controls />
		</>
	);
});

const NullableString = z.string().nullable();

export const action = new Action("/c", async (c) => {
	const data = await c.req.formData();

	let id = NullableString.parse(data.get("id"));
	let text = z.string().parse(data.get("text"));
	let title = NullableString.parse(data.get("title"));
	const web = data.get("web") === "on";
	const model =
		ai.models.find((m) => m.name === data.get("model")) ?? ai.defaultModel;
	const messageIndex = String(data.get("index"));

	c.head(
		<title>
			{async () => {
				if (!title) title = await generateTitle(text);
				return title;
			}}
		</title>,
	);

	return (
		<>
			<PastMessages id={id} />

			{async function* () {
				let imageUrl: string | null = null;
				let urlContent: string | null = null;

				const [first, ...lines] = text.trim().split("\n");

				if (first) {
					const [url, ...rest] = first.split(" ");
					const parsed = z.string().url().safeParse(url);

					if (parsed.success) {
						if (/\.(png|jpe?g|webp|gif)$/i.test(parsed.data)) {
							imageUrl = parsed.data;
						} else {
							const result = await render(parsed.data);

							if (result.success) {
								lines.unshift(rest.join(" "));
								text = lines.join("\n");
								urlContent = result.result;
							}
						}
					}
				}

				// current message input
				const content: ResponseInputContent[] = [{ type: "input_text", text }];
				const input = { role: "user", content } satisfies ResponseInput[number];

				if (urlContent) {
					input.content.unshift({ type: "input_text", text: urlContent });
				}

				if (imageUrl) {
					input.content.unshift({
						type: "input_image",
						image_url: imageUrl,
						detail: "auto",
					});
				}

				let i = parseInt(messageIndex);
				for (const message of input.content) {
					if (message.type === "input_text" || message.type === "input_image") {
						yield (
							<Message
								transitionName={`m-${i}`}
								message={{ role: "user", content: [message] }}
							/>
						);
						i++;
					}
				}

				yield (
					<>
						<div class="chat-bubble py-6">
							{async function* () {
								const htmlStream = processor.renderStream(
									new ReadableStream<string>({
										async start(c) {
											const response = await ai.openai.responses.create({
												input: [input],
												instructions,
												model: model.name,
												reasoning: model.reasoning
													? { effort: "high" }
													: undefined,
												tools:
													web && model.web
														? [{ type: "web_search_preview" }]
														: [],
												stream: true,
												truncation: "auto",
												store: true,
												previous_response_id: id,
											});

											let finalContent = "";

											for await (const event of response) {
												if (
													event.type === "response.output_item.added" &&
													event.item.type === "reasoning"
												) {
													c.enqueue("Reasoning...\n\n");
												} else if (
													event.type === "response.output_text.delta"
												) {
													if (event.delta) {
														c.enqueue(event.delta);
														finalContent += event.delta;
													}
												} else if (event.type === "response.completed") {
													id = event.response.id;
												}
											}

											c.close();
										},
									}),
								);

								const reader = htmlStream.getReader();
								while (true) {
									const { value, done } = await reader.read();
									if (value) yield value;
									if (done) break;
								}
							}}
						</div>

						<Input index={parseInt(messageIndex) + 1} />
						<Controls model={model} web={web} />

						<input
							type="hidden"
							name="title"
							value={escape(title, true)}
						></input>
					</>
				);

				yield <input type="hidden" name="id" value={escape(id, true)} />;
			}}
		</>
	);
});
