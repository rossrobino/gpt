import * as triage from "@/lib/ai/agents/triage";
import { parseDataset } from "@/lib/dataset";
import { fileInput } from "@/lib/file-input";
import * as format from "@/lib/format";
import { toMdCodeBlock } from "@/lib/format";
import { generateTitle } from "@/lib/generate-title";
import { processor } from "@/lib/md";
import { render } from "@/lib/render";
import * as z from "@/lib/schema";
import { AgentNumberAndName } from "@/ui/agents";
import { Chart } from "@/ui/chart";
import { ExistingData } from "@/ui/existing-data";
import { Input } from "@/ui/input";
import { Message } from "@/ui/message";
import { NewLines } from "@/ui/new-lines";
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
			text: z.string().transform((text) => ovr.escape(text)),
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
				const [input, { dataset, dataInput }, renderResult] = await Promise.all(
					[
						fileInput(form.files),
						parseDataset(form.dataset, form.existing),
						render(form.website),
					],
				);

				if (renderResult.success) {
					input.push({ role: "user", content: renderResult.md });
				}

				if (form.image) {
					input.push({
						role: "user",
						content: [{ type: "input_image", image: form.image }],
					});
				}

				input.push(
					// current message input
					{ role: "user", content: form.text },
					...dataInput,
				);

				yield input.map((inp, i) => (
					<Message input={inp} index={form.index + i} />
				));

				const runner = new Runner({
					model: "gpt-4.1-nano",
					modelSettings: { truncation: "auto", store: !form.temporary },
				});

				const triageAgent = triage.create(dataset);

				const result = await runner.run(triageAgent, input, {
					stream: true,
					previousResponseId: form.id,
					maxTurns: 10,
				});

				yield* processor.generate(
					(async function* () {
						for await (const event of result) {
							if (event.type === "raw_model_stream_event") {
								// raw events from the model
								if (event.data.type === "output_text_delta") {
									yield event.data.delta;
								} else if (event.data.type === "model") {
									const modelEvent: OpenAI.Responses.ResponseStreamEvent =
										event.data.event;

									if (
										modelEvent.type === "response.web_search_call.in_progress"
									) {
										yield* ovr.toGenerator(
											<NewLines>
												<WebSearchCall />
											</NewLines>,
										);
									}
								}
							} else if (event.type == "agent_updated_stream_event") {
								// agent updated events
							} else {
								// event.type === "run_item_stream_event"
								// Agent SDK specific events
								if (event.item.type === "handoff_output_item") {
									const target = event.item.targetAgent;
									const index = triageAgent.handoffs.findIndex(
										(agent) => agent === target,
									);

									yield* ovr.toGenerator(
										<NewLines>
											<div class="my-6">
												<AgentNumberAndName agent={target} index={index} />
											</div>
										</NewLines>,
									);
								} else if (event.item.type === "tool_call_item") {
									if (event.item.rawItem.type === "function_call") {
										try {
											const args = JSON.parse(event.item.rawItem.arguments);

											yield toMdCodeBlock(
												"fn-input",
												`${event.item.rawItem.name}(${format.jsFormat(args)})`,
											);
										} catch (error) {
											console.error(error);
										}
									}
								} else if (event.item.type === "tool_call_output_item") {
									if (event.item.rawItem.type === "function_call_result") {
										const { data } = z
											.functionOutput()
											.safeParse(event.item.output);

										if (data) {
											if (data.chartOptions) {
												yield* ovr.toGenerator(
													<NewLines>
														<Chart options={data.chartOptions} />
													</NewLines>,
												);
											}

											if (data.summary) {
												yield* ovr.toGenerator(
													<NewLines>{data.summary}</NewLines>,
												);
											}
										}
									}
								}
							}
						}

						await result.completed;
					})(),
				);

				yield (
					<>
						{!form.temporary && (
							<input type="hidden" name="id" value={result.lastResponseId} />
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
