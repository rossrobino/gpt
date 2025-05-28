import instructions from "@/content/instructions.md?raw";
import * as ai from "@/lib/ai";
import { Deferred } from "@/lib/deferred";
import { fileInput } from "@/lib/file-input";
import { generateTitle } from "@/lib/generate-title";
import { processor } from "@/lib/md";
import { render } from "@/lib/render";
import * as schema from "@/lib/schema";
import { Controls } from "@/ui/controls";
import { Input } from "@/ui/input";
import { Message } from "@/ui/message";
import { PastMessages } from "@/ui/past-messages";
import type { ResponseInputContent } from "openai/resources/responses/responses.mjs";
import { Action, Page } from "ovr";

export const page = new Page("/", (c) => {
	c.head(<title>New Message</title>);

	return (
		<>
			<Input index={0} />
			<Controls />
		</>
	);
});

export const action = new Action("/chat", async (c) => {
	const data = await c.req.formData();

	const id = schema.NullableStringSchema.parse(data.get("id"));
	const web = data.get("web") === "on";
	const model =
		ai.models.find((m) => m.name === data.get("model")) ?? ai.defaultModel;
	const text = schema.StringSchema.parse(data.get("text"));
	const image = schema.URLSchema.safeParse(data.get("image")).data ?? null;
	const website = schema.URLSchema.safeParse(data.get("website")).data ?? null;
	let messageIndex = parseInt(schema.StringSchema.parse(data.get("index")));

	const finalMessageIndex = new Deferred<number>();
	const newId = new Deferred<string>();

	c.head(<title>{generateTitle(data)}</title>);

	return (
		<>
			<PastMessages id={id} />

			{async function* () {
				const [files, renderResult] = await Promise.all([
					fileInput(data),
					render(website),
				]);

				// current message input
				const content: ResponseInputContent[] = [
					...files,
					{ type: "input_text", text },
				];

				if (renderResult.success) {
					content.unshift({ type: "input_text", text: renderResult.md });
				}

				if (image) {
					content.unshift({
						type: "input_image",
						image_url: image,
						detail: "auto",
					});
				}

				// yield current messages
				yield content.map((message) => (
					<Message
						transitionName={`m-${messageIndex++}`}
						message={{ role: "user", content: [message] }}
					/>
				));

				finalMessageIndex.resolve(messageIndex);

				yield (
					<div class="chat-bubble py-6">
						{async function* () {
							const htmlStream = processor.renderStream(
								new ReadableStream<string>({
									async start(c) {
										const response = await ai.openai.responses.create({
											input: [{ role: "user", content }],
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

										for await (const event of response) {
											if (
												event.type === "response.output_item.added" &&
												event.item.type === "reasoning"
											) {
												c.enqueue("Reasoning...\n\n");
											} else if (event.type === "response.output_text.delta") {
												if (event.delta) c.enqueue(event.delta);
											} else if (event.type === "response.completed") {
												newId.resolve(event.response.id);
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
				);
			}}

			{async () => <Input index={await finalMessageIndex.promise} />}

			<Controls model={model} web={web} />

			{async () => (
				<input
					type="hidden"
					name="title"
					value={await generateTitle(data)}
				></input>
			)}

			{async () => (
				<input type="hidden" name="id" value={await newId.promise} />
			)}
		</>
	);
});
