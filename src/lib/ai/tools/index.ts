import type { EChartsOption } from "echarts";
import type { FunctionTool } from "openai/resources/responses/responses.mjs";
import * as z from "zod/v4";

export { data } from "@/lib/ai/tools/data";
export { math } from "@/lib/ai/tools/math";

export const helper = <S extends z.ZodObject = z.ZodObject<any, any>>(options: {
	ArgsSchema: S;
	name: string;
	description: string;
	run: (args: z.infer<S>) => { result?: any; chartOptions?: EChartsOption };
}) => {
	const tool: FunctionTool = {
		type: "function",
		name: options.name,
		description: options.description,
		strict: true,
		parameters: z.toJSONSchema(options.ArgsSchema),
	};

	return { ArgsSchema: options.ArgsSchema, tool, run: options.run };
};
