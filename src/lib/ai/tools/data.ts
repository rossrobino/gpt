import * as tools from "@/lib/ai/tools";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";
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

export const data = (options: { records: unknown }) => {
	const OptionsSchema = z
		.object({ records: z.array(z.record(z.string(), z.unknown())) })
		.transform((o) => {
			const firstRecord = o.records.at(0);

			const allFeatures: string[] = [];
			if (firstRecord) allFeatures.push(...Object.keys(firstRecord));

			return { ...o, allFeatures };
		});

	const { records, allFeatures } = OptionsSchema.parse(options);

	const AnyFeatureSchema = z.enum(allFeatures);

	const dataTools = [
		tools.helper({
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
		tools.helper({
			name: "minimum",
			description: "Find the minimum value of a certain feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => Math.min(...toArray(records, feature)),
		}),
		tools.helper({
			name: "maximum",
			description: "Find the maximum value of a certain feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => Math.max(...toArray(records, feature)),
		}),
		tools.helper({
			name: "count",
			description: "Find the total count of entries for a certain feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => toArray(records, feature).length,
		}),
		tools.helper({
			name: "total",
			description: "Find the sum of entries for a certain feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => add(toArray(records, feature)),
		}),
		tools.helper({
			name: "add",
			description: "Add numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => add(numbers),
		}),
		tools.helper({
			name: "subtract",
			description: "Subtract numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => subtract(numbers),
		}),
		tools.helper({
			name: "multiply",
			description: "Multiply numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => multiply(numbers),
		}),
		tools.helper({
			name: "divide",
			description: "Divide numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => divide(numbers),
		}),
		tools.helper({
			name: "mean",
			description: "Calculate the mean for a given feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => {
				const values = toArray(records, feature);
				return values.length === 0 ? null : add(values) / values.length;
			},
		}),
		tools.helper({
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
		tools.helper({
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
		tools.helper({
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
		tools.helper({
			name: "unique_count",
			description: "Count unique/distinct values for a given feature.",
			ArgsSchema: z.object({ feature: AnyFeatureSchema }),
			run: ({ feature }) => {
				const values = toArray(records, feature);
				return new Set(values).size;
			},
		}),
		tools.helper({
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
		tools.helper({
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

	const input: ResponseInput = [
		{
			role: "user",
			content: `data sample:\n\n\`\`\`json${JSON.stringify(records.slice(0, 10))}\n\`\`\``,
		},
	];

	return { helpers: dataTools, input };
};
