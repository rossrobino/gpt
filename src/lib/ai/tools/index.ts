import * as schema from "@/lib/schema";
import type { EChartsOption } from "echarts";
import type * as ai from "openai";

export { data } from "@/lib/ai/tools/data";

export const helper = <
	S extends schema.ZodObject = schema.ZodObject<any, any>,
>(options: {
	ArgsSchema: S;
	name: string;
	description: string;
	run: (args: schema.infer<S>) => {
		result?: Record<string, unknown>;
		chartOptions?: EChartsOption;
	};
}) => {
	const tool: ai.OpenAI.Responses.FunctionTool = {
		type: "function",
		name: options.name,
		description: options.description,
		strict: true,
		parameters: schema.toJSONSchema(options.ArgsSchema),
	};

	return { ArgsSchema: options.ArgsSchema, tool, run: options.run };
};
