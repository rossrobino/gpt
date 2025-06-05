import * as schema from "@/lib/schema";
import type { EChartsOption } from "echarts";
import type * as ai from "openai";

export { data } from "@/lib/ai/tools/data";

export const tool = <
	S extends schema.ZodObject = schema.ZodObject<any, any>,
>(options: {
	name: string;
	description: string;
	parameters: S;
	execute: (
		args: schema.infer<S>,
	) => Promise<{
		result?: Record<string, unknown>;
		chartOptions?: EChartsOption;
	}>;
}) => {
	const tool: ai.OpenAI.Responses.FunctionTool = {
		type: "function",
		name: options.name,
		description: options.description,
		strict: true,
		parameters: schema.toJSONSchema(options.parameters),
	};

	return { parameters: options.parameters, tool, execute: options.execute };
};
