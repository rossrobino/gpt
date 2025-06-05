import { toCodeBlock } from "@/lib/md/util";
import type * as schema from "@/lib/schema";
import type { ChatMessage } from "@/lib/types";
import { Chart } from "@/ui/chart";
import "dotenv/config";
import type { EChartsOption } from "echarts";
import { OpenAI } from "openai";
import * as ovr from "ovr";

export type { OpenAI } from "openai";

if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set.");

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type Model = { name: string; web?: boolean; reasoning?: boolean };

export const models: Model[] = [
	{ name: "gpt-4.1-nano" },
	{ name: "gpt-4.1-mini", web: true },
	{ name: "gpt-4.1", web: true },
	{ name: "o4-mini", reasoning: true },
];

export const defaultModel = models[0]!;
export const fastestModel = models[0]!;

export type GenerateOptions = Omit<
	OpenAI.Responses.ResponseCreateParamsStreaming,
	"tools" | "stream" | "reasoning" | "truncation" | "input"
> & {
	input: OpenAI.Responses.ResponseInputItem[];
	toolHelpers?: {
		parameters: schema.ZodObject;
		tool: OpenAI.Responses.FunctionTool;
		execute: (
			args: any,
		) => Promise<{
			result?: Record<string, unknown>;
			chartOptions?: EChartsOption;
		}>;
	}[];
};

export async function* generate(options: GenerateOptions) {
	const { toolHelpers, model, ...rest } = options;

	const tools: OpenAI.Responses.Tool[] = toolHelpers?.map((t) => t.tool) ?? [];

	const resolvedModel = models.find((m) => m.name === model) ?? defaultModel;

	if (resolvedModel.web) tools.unshift({ type: "web_search_preview" });

	const response = openai.responses.stream({
		tools,
		model: resolvedModel.name,
		truncation: "auto",
		reasoning: resolvedModel.reasoning ? { effort: "high" } : undefined,
		...rest,
	});

	const outputs: ChatMessage[] = [];

	for await (const event of response) {
		if (event.type === "response.output_item.added") {
			if (event.item.type === "reasoning") {
				yield "Reasoning...\n\n";
			}
		} else if (event.type === "response.output_item.done") {
			if (event.item.type === "message" && toolHelpers) {
				outputs.push(event.item);
			} else if (event.item.type === "function_call" && toolHelpers) {
				const output = event.item;

				const helper = toolHelpers.find((h) => output.name === h.tool.name);

				if (helper) {
					outputs.push(output);

					const args = helper.parameters.parse(JSON.parse(output.arguments));

					const { result, chartOptions } = await helper.execute(args);

					outputs.push({
						type: "function_call_output",
						call_id: output.call_id,
						output: JSON.stringify(result),
					});

					yield toCodeBlock("function", JSON.stringify(result, null, 4));

					if (chartOptions) {
						const chart = `${await ovr.toString(Chart({ options: chartOptions }))}\n\n`;

						// outputs.push({
						// 	id: undefined as unknown as string, // hack to save chart -- id is created
						// 	status: "completed",
						// 	type: "message",
						// 	role: "assistant",
						// 	content: [{ type: "output_text", annotations: [], text: chart }],
						// });

						yield chart; // stream in current message
					}
				}
			}
		} else if (event.type === "response.output_text.delta") {
			if (event.delta) yield event.delta;
		} else if (event.type === "response.completed") {
			return { id: event.response.id, outputs };
		}
	}

	throw new Error("Response never completed.");
}
