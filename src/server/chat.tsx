import { createDataAgent } from "@/lib/ai/agents/data";
import * as triage from "@/lib/ai/agents/triage";
import { parseDataset } from "@/lib/dataset";
import { fileInput } from "@/lib/file-input";
import { generateTitle } from "@/lib/generate-title";
import { processor } from "@/lib/md";
import { render } from "@/lib/render";
import * as z from "@/lib/schema";
import { Chart } from "@/ui/chart";
import { ExistingData } from "@/ui/existing-data";
import { Input } from "@/ui/input";
import { Message } from "@/ui/message";
import { PastMessages } from "@/ui/past-messages";
import { Agent, Runner, type AgentInputItem } from "@openai/agents";
import * as ovr from "ovr";

export const action = new ovr.Action("/chat", async (c) => {
	const data = z
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
				const input: AgentInputItem[] = [
					...fileInputs,
					{ role: "user", content: data.text ?? "" },
				];

				if (renderResult.success) {
					input.unshift({ role: "user", content: renderResult.md });
				}

				if (data.image) {
					input.unshift({
						role: "user",
						content: [{ type: "input_image", image: data.image }],
					});
				}

				yield (
					<>
						{input.map((inp, i) => (
							<Message input={inp} index={data.index + i} />
						))}

						{processor.generate(
							(async function* () {
								const handoffs: Agent[] = [];

								const dataAgent = createDataAgent(dataset);
								if (dataAgent) handoffs.push(dataAgent);

								triage.agent.handoffs.push(...handoffs);

								const runner = new Runner({
									model: "gpt-4.1-nano",
									modelSettings: { truncation: "auto", store: !data.temporary },
								});

								if (import.meta.env.DEV) {
									runner.on("agent_start", (_c, agent) =>
										console.log("[agent_start]", agent.name),
									);
									runner.on("agent_end", (_c, agent) =>
										console.log("[agent_end]", agent.name),
									);
									runner.on("agent_handoff", (_c, agent) =>
										console.log("[agent_handoff]", agent.name),
									);
								}

								const result = await runner.run(triage.agent, input, {
									stream: true,
									previousResponseId: data.id,
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
										if (event.item.type === "tool_call_output_item") {
											if (event.item.rawItem.type === "function_call_result") {
												if (import.meta.env.DEV) {
													console.log("[function]", event.item.rawItem.name);
												}

												const { data } = z
													.functionOutput()
													.safeParse(event.item.output);

												if (data?.chartOptions) {
													yield `${await ovr.toString(Chart({ options: data.chartOptions }))}\n\n`;
												}
											}
										}
									}
								}

								await result.completed;

								if (!data.temporary) {
									yield "\n\n" +
										(await ovr.toString(
											<input
												type="hidden"
												name="id"
												value={result.lastResponseId}
											/>,
										));
								}
							})(),
						)}

						<Input
							index={data.index + 1}
							store={!data.temporary}
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
					value={await generateTitle(data.title, data.text)}
				></input>
			)}
		</>
	);
});
