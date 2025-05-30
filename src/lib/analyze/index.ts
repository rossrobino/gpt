import * as ai from "@/lib/ai";
import * as schema from "@/lib/schema";
import type {
	ResponseInputItem,
	ResponseOutputItem,
} from "openai/resources/responses/responses.mjs";
import { linearRegression } from "simple-statistics";

/**
 * Converts an array of objects into an array of arrays, selecting values by given keys.
 *
 * @param records Array of records
 * @param features Features of interest
 * @returns An array containing arrays of each feature in order
 */
const toArrays = (
	records: typeof schema.UnknownRecordArraySchema._output,
	features: ReturnType<typeof schema.CreateAnalyzeFeaturesSchema>["_output"],
) => {
	return records.map((record) => features.map((feature) => record[feature]));
};

const analyze = (
	options: ReturnType<typeof schema.CreateAnalyzeSchema>["_output"],
) => {
	const { data: parsed } = schema
		.CreateAnalyzeSchema(options.features)
		.safeParse(options);

	if (parsed) {
		const { method, records, features } = parsed;

		const arrays = toArrays(records, features);

		if (method === "linear_regression") {
			const { data: numberMatrix } =
				schema.NumberMatrixSchema.safeParse(arrays);

			if (numberMatrix) return linearRegression(numberMatrix);
		}
	}
};

export const tool = async (
	records: Record<string, unknown>[],
	features: string[],
	text: string,
) => {
	const JsonSchema = schema.CreateAnalyzeJsonSchema(features);

	const response = await ai.openai.responses.create({
		model: "gpt-4.1-mini",
		input: `${text}\n\ndata sample:\n\n\`\`\`json${JSON.stringify(records.slice(0, 100))}\n\`\`\``,
		instructions:
			"Each analysis will have features that they are interested in, the first is the independent and the second is the dependant. Don't worry about the actual data, it will be entered in the function automatically. You just need to provide the method and features.",
		tools: [
			{
				type: "function",
				name: "analyze-data",
				description: "Analyze data with statical methods.",
				parameters: JsonSchema,
				strict: true,
			},
		],
	});

	const outputs: (ResponseInputItem.FunctionCallOutput | ResponseOutputItem)[] =
		[];

	for (const output of response.output) {
		if (output.type === "function_call") {
			outputs.push(output);

			const args = JSON.parse(output.arguments);
			const result = analyze({ records, ...args });

			outputs.push({
				type: "function_call_output",
				call_id: output.call_id,
				output: JSON.stringify(result),
			});
		}
	}

	return outputs;
};
