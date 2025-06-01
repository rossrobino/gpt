import type { FunctionTool } from "openai/resources/responses/responses.mjs";
import * as z from "zod/v4";

export { data } from "@/lib/ai/tools/data";

export const helper = <S extends z.ZodObject = z.ZodObject<any, any>>(options: {
	ArgsSchema: S;
	name: string;
	description: string;
	run: (args: z.infer<S>) => any;
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
