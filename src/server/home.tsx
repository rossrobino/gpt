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
	const formData = await c.req.formData();
	const data = schema
		.formData({
			id: schema.string().nullable(),
			title: schema.string().nullable(),
			text: schema.string(),
			image: schema.httpUrl(),
			website: schema.httpUrl(),
			files: schema.files(),
			directory: schema.files(),
			index: schema.coerce.number(),
			dataset: schema.fileOrNull(),
			existing: schema.string().nullable(),
			temporary: schema.checkbox(),
		})
		.parse(formData);

	const newId = new Deferred<string>();

	c.head(<title>{generateTitle(data.title, data.text)}</title>);

	return (
		<>
			<PastMessages id={data.id} />

			{async function* () {
				const [fileInputs, dataset, renderResult] = await Promise.all([
					fileInput(data.files),
					parseDataset(data.dataset, data.existing),
					render(data.website),
				]);

				// current message input
				const content: ai.OpenAI.Responses.ResponseInputContent[] = [
					...fileInputs,
					{ type: "input_text", text: data.text },
				];

				if (renderResult.success) {
					content.unshift({ type: "input_text", text: renderResult.md });
				}

				if (data.image) {
					content.unshift({
						type: "input_image",
						image_url: data.image,
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
						<Message index={data.index} message={message} />

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
														{ role: "user", content: data.text },
														...dataTools.input,
													],
													previous_response_id: data.id,
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
												store: !data.temporary,
												previous_response_id: data.id,
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

						<Input index={data.index + 1} />
						<Controls store={!data.temporary} />

						<ExistingData dataset={dataset} />
					</>
				);
			}}

			{async () => (
				<input
					type="hidden"
					name="title"
					value={await generateTitle(data.title, data.text)}
				></input>
			)}

			{async () => {
				if (!data.temporary)
					return <input type="hidden" name="id" value={await newId.promise} />;
			}}
		</>
	);
});
