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
import { Approvals } from "@/ui/approval";
import { Chart } from "@/ui/chart";
import { ExistingData } from "@/ui/existing-data";
import { Input } from "@/ui/input";
import { Message } from "@/ui/message";
import { NewLines } from "@/ui/new-lines";
import { PastMessages } from "@/ui/past-messages";
import { WebSearchCall } from "@/ui/web-search-call";
import {
	type Agent,
	type AgentInputItem,
	Runner,
	RunState,
	RunToolApprovalItem,
} from "@openai/agents";
import type { OpenAI } from "openai";
import * as ovr from "ovr";

export const action = new ovr.Action("/chat", async (c) => {
	const form = z
		.formData({
			/** Previous response ID */
			id: z
				.string()
				.nullable()
				.transform((id) => (!id ? undefined : id)),
			/** Previously generated title */
			title: z.string().nullable(),
			/** The user's current text message */
			text: z.escape(),
			/** Image URL */
			image: z.httpUrl(),
			/** Website URL to render */
			website: z.httpUrl(),
			/** File inputs */
			files: z.files(),
			/** Directory inputs */
			directory: z.files(),
			/** Current message index */
			index: z.coerce.number(),
			/** New dataset submitted from file input */
			dataset: z.fileOrNull(),
			/** Existing dataset sent back from hidden input */
			existing: z.string().nullable(),
			/** Do not store message for future use */
			temporary: z.checkbox(),
			/** State sent back from hidden input to use for approvals */
			state: z.state(),
			/** Any interruptions that were approved */
			approval: z.interruptions(),
			/** All interruptions - difference of this and approved are the rejected */
			interruption: z.interruptions(),
		})
		.parse(await c.req.formData());

	c.head(<title>{generateTitle(form.title, form.text)}</title>);

	return (
		<>
			<PastMessages id={form.id} />

			{async function* () {
				let stateOrInput: RunState<{}, Agent> | AgentInputItem[] = [];

				const [fileInputItems, { dataset, dataInput }, renderResult] =
					await Promise.all([
						fileInput(form.files),
						parseDataset(form.dataset, form.existing),
						render(form.website),
					]);

				const triageAgent = triage.create(dataset);

				if (form.state) {
					// process approvals
					form.id = undefined; // use the run state instead
					stateOrInput = await RunState.fromString(triageAgent, form.state);

					for (const approval of form.approval) {
						stateOrInput.approve(
							new RunToolApprovalItem(approval.rawItem, approval.agent),
						);
					}

					if (form.approval.length < form.interruption.length) {
						const approvedIds = form.approval.map((int) => int.rawItem.id);
						const rejections = form.interruption.filter(
							(int) => !approvedIds.includes(int.rawItem.id),
						);

						for (const rejection of rejections) {
							stateOrInput.reject(
								new RunToolApprovalItem(rejection.rawItem, rejection.agent),
							);
						}
					}
				} else {
					// normal message (no approvals)
					// add all the various inputs
					stateOrInput.push(...fileInputItems);

					if (renderResult.success) {
						stateOrInput.push({ role: "system", content: renderResult.md });
					}

					if (form.image) {
						stateOrInput.push({
							role: "user",
							content: [{ type: "input_image", image: form.image }],
						});
					}

					stateOrInput.push(
						// current message input
						{ role: "user", content: form.text },
						...dataInput,
					);

					yield stateOrInput.map((inp, i) => (
						<Message input={inp} index={form.index + i} />
					));
				}

				const runner = new Runner({
					model: "gpt-4.1-nano",
					modelSettings: { truncation: "auto", store: !form.temporary },
				});

				const result = await runner.run(triageAgent, stateOrInput, {
					stream: true,
					previousResponseId: form.id,
				});

				yield* processor.generate(
					(async function* () {
						const interruptions: RunToolApprovalItem[] = [];

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
												"fn",
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
											// additional items to render for the user
											// from the function result
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
								} else if (event.type === "run_item_stream_event") {
									if (event.item.type === "tool_approval_item") {
										interruptions.push(event.item);
									}
								}
							}
						}

						if (interruptions.length) {
							// ask for approvals and send serialized state
							yield* ovr.toGenerator(
								<NewLines>
									<Approvals interruptions={interruptions} />
									{/* don't do this if you want to hide system prompt and other info, it'd be nice to use the previous response id to obtain again. */}
									<input
										type="hidden"
										name="state"
										value={ovr.escape(JSON.stringify(result.state), true)}
									/>
								</NewLines>,
							);
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
