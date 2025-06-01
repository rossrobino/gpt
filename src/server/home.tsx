import instructions from "@/content/instructions.md?raw";
import * as ai from "@/lib/ai";
import * as tools from "@/lib/ai/tools";
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
	const text = schema.StringSchema.parse(data.get("text"));
	const image = schema.URLSchema.safeParse(data.get("image")).data ?? null;
	const website = schema.URLSchema.safeParse(data.get("website")).data ?? null;
	const files = (
		schema.FilesSchema.safeParse([
			...data.getAll("files"),
			...data.getAll("directory"),
		]).data ?? []
	).filter((file) => file.size);
	let messageIndex = parseInt(schema.StringSchema.parse(data.get("index")));

	const finalMessageIndex = new Deferred<number>();
	const newId = new Deferred<string>();

	c.head(<title>{generateTitle(data)}</title>);

	return (
		<>
			<PastMessages id={id} />

			{async function* () {
				const [{ fileInputs, datasets }, renderResult] = await Promise.all([
					fileInput({ files }),
					render(website),
				]);

				// current message input
				const content: ResponseInputContent[] = [
					...fileInputs,
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

				// yield current message(s)
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
										const fnOutputs = await Promise.all(
											datasets.map(async (records) => {
												const dataTools = tools.data({ records });

												const dataGen = ai.generate({
													model: "gpt-4.1",
													input: [
														{ role: "user", content: text },
														...dataTools.input,
													],
													previous_response_id: id,
													toolHelpers: dataTools.helpers,
												});

												while (true) {
													const { value, done } = await dataGen.next();

													if (done) return value.outputs;
													else c.enqueue(value);
												}
											}),
										);

										const mainGen = ai.generate({
											input: [{ role: "user", content }, ...fnOutputs.flat()],
											instructions,
											model: "gpt-4.1-mini",
											store: true,
											previous_response_id: id,
										});

										while (true) {
											const { value, done } = await mainGen.next();

											if (done) {
												newId.resolve(value.id);
												break;
											} else c.enqueue(value);
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

			<Controls />

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
