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
import { Agent, Runner } from "@openai/agents";
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

				const agent = triage.create(dataset);

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

								if (import.meta.env.DEV) {
									runner.on("agent_start", (_c, agent) =>
										console.log("[agent_start]", agent.name),
									);
								}

								const result = await runner.run(agent, input, {
									stream: true,
									previousResponseId: form.id,
									context: { dataset },
								});

								for await (const event of result) {
									if (event.type === "raw_model_stream_event") {
										// raw events from the model
										if (event.data.type === "output_text_delta") {
											yield event.data.delta;
										}
									} else if (event.type == "agent_updated_stream_event") {
										// agent updated events
									} else if (event.type === "run_item_stream_event") {
										// Agent SDK specific events
										if (event.item.type === "handoff_output_item") {
											yield* ovr.toGenerator(
												<Handoff agentName={event.item.targetAgent.name} />,
											);
										} else if (event.item.type === "tool_call_output_item") {
											if (event.item.rawItem.type === "function_call_result") {
												yield* ovr.toGenerator(
													<FunctionCall name={event.item.rawItem.name} />,
												);
												if (import.meta.env.DEV) {
													console.log("[function]", event.item.rawItem.name);
												}

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
							agents={agent.handoffs.filter((a) => a instanceof Agent)}
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
