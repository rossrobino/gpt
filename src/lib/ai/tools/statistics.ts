import * as ai from "@/lib/ai";
import { linearRegression } from "simple-statistics";
import * as z from "zod/v4";

const toArray = (records: Record<string, unknown>[], feature: string) => {
	return z.array(z.number()).parse(records.map((record) => record[feature]));
};

const add = (numbers: number[]) => numbers.reduce((arr, curr) => arr + curr, 0);
const subtract = (numbers: number[]) =>
	numbers.length === 0
		? 0
		: numbers.slice(1).reduce((acc, curr) => acc - curr, numbers[0]!);
const multiply = (numbers: number[]) =>
	numbers.reduce((arr, curr) => arr * curr, 0);
const divide = (numbers: number[]) =>
	numbers.length === 0
		? 0
		: numbers.slice(1).reduce((acc, curr) => acc / curr, numbers[0]!);

export const analyze = async (options: {
	records: unknown;
	text: unknown;
	id: string | null;
}) => {
	const { id, ...rest } = options;

	const OptionsSchema = z
		.object({
			records: z.array(z.record(z.string(), z.unknown())),
			text: z.string(),
		})
		.transform((o) => {
			const firstRecord = o.records.at(0);

			const allFeatures: string[] = [];
			if (firstRecord) allFeatures.push(...Object.keys(firstRecord));

			return { ...o, allFeatures };
		});

	const { records, allFeatures, text } = OptionsSchema.parse(rest);

	const AnyFeatureSchema = z.enum(allFeatures);

	const toolHelpers = [
		ai.toolHelper({
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

				const pairs = independent.map((x, i) => [x, dependent[i]!]);

				return linearRegression(pairs);
			},
		}),
		ai.toolHelper({
			name: "minimum",
			description: "Find the minimum value of a certain feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => Math.min(...toArray(records, feature)),
		}),
		ai.toolHelper({
			name: "maximum",
			description: "Find the maximum value of a certain feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => Math.max(...toArray(records, feature)),
		}),
		ai.toolHelper({
			name: "count",
			description: "Find the total count of entries for a certain feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => toArray(records, feature).length,
		}),
		ai.toolHelper({
			name: "total",
			description: "Find the sum of entries for a certain feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => add(toArray(records, feature)),
		}),
		ai.toolHelper({
			name: "add",
			description: "Add numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => add(numbers),
		}),
		ai.toolHelper({
			name: "subtract",
			description: "Subtract numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => subtract(numbers),
		}),
		ai.toolHelper({
			name: "multiply",
			description: "Multiply numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => multiply(numbers),
		}),
		ai.toolHelper({
			name: "divide",
			description: "Divide numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => divide(numbers),
		}),
		ai.toolHelper({
			name: "mean",
			description: "Calculate the mean for a given feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => {
				const values = toArray(records, feature);
				return values.length === 0 ? null : add(values) / values.length;
			},
		}),
		ai.toolHelper({
			name: "median",
			description: "Calculate the median for a given feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => {
				const values = toArray(records, feature)
					.slice()
					.sort((a, b) => a - b);
				const n = values.length;
				if (n === 0) return null;
				if (n % 2 === 1) return values[Math.floor(n / 2)];
				return (values[n / 2]! + values[n / 2 - 1]!) / 2;
			},
		}),
		ai.toolHelper({
			name: "mode",
			description: "Find the mode (most frequent) value for a given feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => {
				const values = toArray(records, feature);
				const freq: Record<number, number> = {};
				values.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
				let max = 0,
					mode = null;
				Object.entries(freq).forEach(([val, count]) => {
					if (count > max) {
						max = count;
						mode = Number(val);
					}
				});
				return mode;
			},
		}),
		ai.toolHelper({
			name: "standard_deviation",
			description: "Calculate the standard deviation for a given feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => {
				const values = toArray(records, feature);
				const mean = add(values) / values.length;
				const variance =
					values.reduce((sum, val) => sum + (val - mean) ** 2, 0) /
					values.length;
				return Math.sqrt(variance);
			},
		}),
		ai.toolHelper({
			name: "unique_count",
			description: "Count unique/distinct values for a given feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => {
				const values = toArray(records, feature);
				return new Set(values).size;
			},
		}),
		ai.toolHelper({
			name: "percentile",
			description: "Find a percentile for a given feature.",
			ArgsSchema: z.object({
				feature: AnyFeatureSchema,
				percentile: z.number(),
			}),
			run: ({ feature, percentile }) => {
				const values = toArray(records, feature).sort((a, b) => a - b);
				if (values.length === 0) return null;
				const idx = Math.floor((percentile / 100) * (values.length - 1));
				return values[idx];
			},
		}),
		ai.toolHelper({
			name: "correlation",
			description: "Calculate Pearson correlation between two features.",
			ArgsSchema: z.object({
				features: z.object({
					independent: AnyFeatureSchema,
					dependent: AnyFeatureSchema,
				}),
			}),
			run: ({ features }) => {
				const x = toArray(records, features.independent);
				const y = toArray(records, features.dependent);

				const n = x.length;

				const meanX = add(x) / n;
				const meanY = add(y) / n;

				const cov =
					x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i]! - meanY), 0) / n;

				const stdX = Math.sqrt(
					x.reduce((sum, xi) => sum + (xi - meanX) ** 2, 0) / n,
				);
				const stdY = Math.sqrt(
					y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0) / n,
				);

				return cov / (stdX * stdY);
			},
		}),
	];

	return ai.handleStream({
		body: {
			model: "gpt-4.1",
			input: `${text}\n\ndata sample:\n\n\`\`\`json${JSON.stringify(records.slice(0, 10))}\n\`\`\``,
			previous_response_id: id,
		},
		toolHelpers,
	});
};
