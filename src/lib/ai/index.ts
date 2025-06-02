import type { helper } from "@/lib/ai/tools";
import { Chart } from "@/ui/chart";
import "dotenv/config";
import { OpenAI } from "openai";
import type {
	FunctionTool,
	ResponseInputItem,
	ResponseOutputItem,
} from "openai/resources/responses/responses.mjs";
import * as ovr from "ovr";
import * as z from "zod/v4";

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

export async function* generate(
	options: Omit<
		OpenAI.Responses.ResponseCreateParamsStreaming,
		"tools" | "stream" | "reasoning" | "truncation"
	> & {
		toolHelpers?: {
			ArgsSchema: z.ZodObject;
			tool: FunctionTool;
			run: (...args: any[]) => any;
		}[];
	},
) {
	const { toolHelpers, model, ...rest } = options;

	const tools: OpenAI.Responses.Tool[] = toolHelpers?.map((t) => t.tool) ?? [];

	const resolvedModel = models.find((m) => m.name === model) ?? defaultModel;

	if (resolvedModel.web) tools.unshift({ type: "web_search_preview" });

	const response = await openai.responses.create({
		tools,
		model: resolvedModel.name,
		stream: true,
		truncation: "auto",
		reasoning: resolvedModel.reasoning ? { effort: "high" } : undefined,
		...rest,
	});

	const outputs: (ResponseInputItem.FunctionCallOutput | ResponseOutputItem)[] =
		[];

	for await (const event of response) {
		if (event.type === "response.output_item.added") {
			if (event.item.type === "reasoning") {
				yield "Reasoning...\n\n";
			}
		} else if (event.type === "response.output_item.done") {
			if (event.item.type === "function_call" && toolHelpers) {
				const output = event.item;

				const tool = toolHelpers.find((t) => output.name === t.tool.name);

				if (tool) {
					outputs.push(output);

					const args = tool.ArgsSchema.parse(JSON.parse(output.arguments));

					const { result, chartOptions } = tool.run(args as any) as ReturnType<
						ReturnType<typeof helper>["run"]
					>;

					const summary = `${JSON.stringify(result, null, 4)}`;

					yield `\`\`\`json\n${summary}\n\`\`\`\n`;

					if (chartOptions) {
						yield ovr.toString(Chart({ options: chartOptions }));
						yield "\n\n";
					}

					if (import.meta.env.DEV) {
						console.log(summary);
					}

					outputs.push({
						type: "function_call_output",
						call_id: output.call_id,
						output: JSON.stringify(result),
					});
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
