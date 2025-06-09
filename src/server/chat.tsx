import * as triage from "@/lib/ai/agents/triage";
import { parseDataset } from "@/lib/dataset";
import { fileInput } from "@/lib/file-input";
import { generateTitle } from "@/lib/generate-title";
import { processor } from "@/lib/md";
import { render } from "@/lib/render";
import * as z from "@/lib/schema";
import { Chart } from "@/ui/chart";
import { ExistingData } from "@/ui/existing-data";
import { FunctionCall } from "@/ui/function-call";
import { Handoff } from "@/ui/handoff";
import { Input } from "@/ui/input";
import { Message } from "@/ui/message";
import { PastMessages } from "@/ui/past-messages";
import { WebSearchCall } from "@/ui/web-search-call";
import { Runner } from "@openai/agents";
import type OpenAI from "openai";
import * as ovr from "ovr";

export const action = new ovr.Action("/chat", async (c) => {
	const form = z
		.formData({
			id: z
				.string()
				.nullable()
				.transform((id) => (!id ? undefined : id)),
			title: z.string().nullable(),
			text: z.string(),
			image: z.httpUrl(),
			website: z.httpUrl(),
			files: z.files(),
			directory: z.files(),
			index: z.coerce.number(),
			dataset: z.fileOrNull(),
			existing: z.string().nullable(),
			temporary: z.checkbox(),
		})
		.parse(await c.req.formData());

	c.head(<title>{generateTitle(form.title, form.text)}</title>);

	return (
		<>
			<PastMessages id={form.id} />

			{async function* () {
				const [input, dataset, renderResult] = await Promise.all([
					fileInput(form.files),
					parseDataset(form.dataset, form.existing),
					render(form.website),
				]);

				if (renderResult.success) {
					input.push({ role: "user", content: renderResult.md });
				}

				if (form.image) {
					input.push({
						role: "user",
						content: [{ type: "input_image", image: form.image }],
					});
				}

				// current message input
				input.push({ role: "user", content: form.text });

				yield (
					<>
						{input.map((inp, i) => (
							<Message input={inp} index={form.index + i} />
						))}

						{processor.generate(
							(async function* () {
								const runner = new Runner({
									model: "gpt-4.1-nano",
									modelSettings: { truncation: "auto", store: !form.temporary },
								});

								const result = await runner.run(triage.create(dataset), input, {
									stream: true,
									previousResponseId: form.id,
									context: { dataset },
								});

								for await (const event of result) {
									if (event.type === "raw_model_stream_event") {
										// raw events from the model
										if (event.data.type === "output_text_delta") {
											yield event.data.delta;
										} else if (event.data.type === "model") {
											const modelEvent: OpenAI.Responses.ResponseStreamEvent =
												event.data.event;

											if (
												modelEvent.type ===
												"response.web_search_call.in_progress"
											) {
												yield* ovr.toGenerator(<WebSearchCall />);
											}
										}
									} else if (event.type == "agent_updated_stream_event") {
										// agent updated events
									} else {
										// event.type === "run_item_stream_event"
										// Agent SDK specific events
										if (event.item.type === "handoff_output_item") {
											yield* ovr.toGenerator(
												<Handoff agentName={event.item.targetAgent.name} />,
											);
										} else if (event.item.type === "tool_call_output_item") {
											console.log(event.item.rawItem);
											if (event.item.rawItem.type === "function_call_result") {
												yield* ovr.toGenerator(
													<FunctionCall name={event.item.rawItem.name} />,
												);

												const { data } = z
													.functionOutput()
													.safeParse(event.item.output);

												if (data?.chartOptions) {
													yield* ovr.toGenerator(
														Chart({ options: data.chartOptions }),
													);
													yield "\n\n";
												}
											}
										}
									}
								}

								await result.completed;

								if (!form.temporary) {
									yield "\n\n";
									yield* ovr.toGenerator(
										<input
											type="hidden"
											name="id"
											value={result.lastResponseId}
										/>,
									);
								}
							})(),
						)}

						<Input
							index={form.index + 1}
							store={!form.temporary}
							undo={true}
							clear={true}
						/>

						<ExistingData dataset={dataset} />
					</>
				);
			}}

			{async () => (
				<input
					type="hidden"
					name="title"
					value={await generateTitle(form.title, form.text)}
				></input>
			)}
		</>
	);
});
