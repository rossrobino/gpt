import * as ai from "@/lib/ai";
import type {
	FunctionTool,
	ResponseInputItem,
	ResponseOutputItem,
} from "openai/resources/responses/responses.mjs";
import { linearRegression } from "simple-statistics";
import * as z from "zod/v4";

const toArray = (records: Record<string, unknown>[], feature: string) => {
	return z.array(z.number()).parse(records.map((record) => record[feature]));
};

const method = <S extends z.ZodObject>(options: {
	ArgsSchema: S;
	name: string;
	description: string;
	run: (args: z.infer<S>) => unknown;
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

export const analyze = async (options: { records: unknown; text: unknown }) => {
	const OptionsSchema = z
		.object({
			records: z.array(z.record(z.string(), z.unknown())),
			text: z.string(),
		})
		.transform((options) => {
			const firstRecord = records.at(0);

			const allFeatures: string[] = [];
			if (firstRecord) allFeatures.push(...Object.keys(firstRecord));

			return { ...options, allFeatures };
		});

	const { records, allFeatures, text } = OptionsSchema.parse(options);

	const AnyFeatureSchema = z.enum(allFeatures);

	const methods = [
		method({
			name: "linear_regression",
			description: "Run a linear regression on data with relevant features.",
			ArgsSchema: z.object({
				features: z.object({
					dependent: AnyFeatureSchema,
					independent: AnyFeatureSchema, // could be multiple if multiple regression in the future
				}),
			}),
			run: ({ features }) => {
				const independent = toArray(records, features.independent);
				const dependent = toArray(records, features.dependent);

				return linearRegression([independent, dependent]);
			},
		}),
	];

	const response = await ai.openai.responses.create({
		model: "gpt-4.1-mini",
		input: `${text}\n\ndata sample:\n\n\`\`\`json${JSON.stringify(records.slice(0, 50))}\n\`\`\``,
		instructions:
			"Each analysis will have features that they are interested in. Don't worry about the actual data, it will be entered in the function automatically. You just need to provide the features to the function.",
		tools: methods.map((method) => method.tool),
	});

	const outputs: (ResponseInputItem.FunctionCallOutput | ResponseOutputItem)[] =
		[];

	for (const output of response.output) {
		if (output.type === "function_call") {
			const method = methods.find((method) => output.name === method.tool.name);

			if (method) {
				outputs.push(output);

				const args = method.ArgsSchema.parse(JSON.parse(output.arguments));

				const result = method.run(args);

				outputs.push({
					type: "function_call_output",
					call_id: output.call_id,
					output: JSON.stringify(result),
				});
			}
		}
	}

	return outputs;
};
