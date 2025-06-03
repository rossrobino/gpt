import instructions from "@/content/instructions.md?raw";
import * as ai from "@/lib/ai";
import * as tools from "@/lib/ai/tools";
import { parseDataset } from "@/lib/dataset";
import { Deferred } from "@/lib/deferred";
import { fileInput } from "@/lib/file-input";
import { generateTitle } from "@/lib/generate-title";
import { processor } from "@/lib/md";
import { render } from "@/lib/render";
import * as schema from "@/lib/schema";
import { Controls } from "@/ui/controls";
import { ExistingData } from "@/ui/existing-data";
import { Input } from "@/ui/input";
import { Message } from "@/ui/message";
import { PastMessages } from "@/ui/past-messages";
import { Action, Page } from "ovr";

export const page = new Page("/", (c) => {
	c.head(<title>New Message</title>);

	return (
		<>
			<Input index={0} />
			<Controls store={true} />
		</>
	);
});

export const action = new Action("/chat", async (c) => {
	const data = await c.req.formData();

	let id = schema.string().nullable().parse(data.get("id"));
	const title = schema.string().nullable().parse(data.get("title"));
	const text = schema.string().parse(data.get("text"));
	const image = schema.url().safeParse(data.get("image")).data ?? null;
	const website = schema.url().safeParse(data.get("website")).data ?? null;
	const files = schema.FilesSchema.parse([
		...data.getAll("files"),
		...data.getAll("directory"),
	]);
	const messageIndex = parseInt(schema.string().parse(data.get("index")));
	const dataFile = schema.file().nullable().parse(data.get("dataset"));
	const existing = schema
		.string()
		.nullable()
		.parse(data.get("existing-dataset"));
	const store = data.get("no-store") !== "on";

	const newId = new Deferred<string>();

	c.head(<title>{generateTitle(title, text)}</title>);

	return (
		<>
			<PastMessages id={id} />

			{async function* () {
				let [fileInputs, dataset, renderResult] = await Promise.all([
					fileInput(files),
					parseDataset(dataFile, existing),
					render(website),
				]);

				// current message input
				const content: ai.OpenAI.Responses.ResponseInputContent[] = [
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

				const message: ai.OpenAI.Responses.ResponseInputItem = {
					role: "user",
					type: "message",
					content,
				};

				yield (
					<>
						<Message transitionName={`m-${messageIndex}`} message={message} />

						<div class="my-trim my-6">
							{async function* () {
								const htmlStream = processor.renderStream(
									new ReadableStream<string>({
										async start(c) {
											const input: ai.OpenAI.Responses.ResponseInput = [
												message,
											];

											if (dataset) {
												const dataTools = tools.data(dataset);

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

													if (done) {
														// add function calls to the input
														input.push(...value.outputs);
														break;
													} else c.enqueue(value); // enqueue any streamed text
												}
											}

											const mainGen = ai.generate({
												input,
												instructions,
												model: "gpt-4.1-mini",
												store,
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

						<Input index={messageIndex + 1} />
						<Controls store={store} />

						<ExistingData dataset={dataset} />
					</>
				);
			}}

			{async () => (
				<input
					type="hidden"
					name="title"
					value={await generateTitle(title, text)}
				></input>
			)}

			{async () => {
				if (store)
					return <input type="hidden" name="id" value={await newId.promise} />;
			}}
		</>
	);
});
