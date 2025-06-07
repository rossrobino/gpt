import instructions from "@/lib/ai/agents/data/instructions.md?raw";
import * as math from "@/lib/math";
import { toCodeBlock } from "@/lib/md/util";
import type { Dataset } from "@/lib/types";
import { tool, Agent } from "@openai/agents";
import * as stats from "simple-statistics";
import * as z from "zod";

const toArray = (dataset: Record<string, unknown>[], feature: string) => {
	return z.array(z.number()).parse(dataset.map((record) => record[feature]));
};

export const createDataAgent = (dataset: Dataset) => {
	if (!dataset) return null;

	const allFeatures = Object.keys(dataset.at(0) ?? {}).map((feat) =>
		z.literal(feat),
	);

	// @ts-expect-error - zod 4 enum works, can just pass the keys
	const AnyFeatureSchema = z.union(allFeatures);

	const tools = [
		// helper({
		// 	name: "sum",
		// 	description: "Add numbers with precision.",
		// 	ArgsSchema: schema.object({ numbers: schema.array(schema.number()) }),
		// 	execute: async ({ numbers }) => ({ result: stats.sum(numbers) }),
		// }),
		// helper({
		// 	name: "difference",
		// 	description: "Subtract numbers with precision.",
		// 	ArgsSchema: schema.object({ numbers: schema.array(schema.number()) }),
		// 	execute: async ({ numbers }) => ({ result: math.difference(numbers) }),
		// }),
		// helper({
		// 	name: "product",
		// 	description: "Multiply numbers with precision.",
		// 	ArgsSchema: schema.object({ numbers: schema.array(schema.number()) }),
		// 	execute: async ({ numbers }) => ({ result: stats.product(numbers) }),
		// }),
		// helper({
		// 	name: "quotient",
		// 	description: "Divide numbers with precision.",
		// 	ArgsSchema: schema.object({ numbers: schema.array(schema.number()) }),
		// 	execute: async ({ numbers }) => ({ result: math.quotient(numbers) }),
		// }),
		tool({
			name: "linear_regression",
			description: "Run a linear regression on data with relevant features.",
			parameters: z.object({
				features: z.object({
					dependent: AnyFeatureSchema,
					independent: AnyFeatureSchema, // could be multiple if multiple regression in the future
				}),
			}),
			execute: ({ features }) => {
				const independent = toArray(dataset, features.independent);
				const dependent = toArray(dataset, features.dependent);
				const pairs = independent.map((x, i) => [x, dependent[i]!]);
				const regression = stats.linearRegression(pairs);
				const regressionLine = stats.linearRegressionLine(regression);
				const iMin = stats.min(independent);
				const iMax = stats.max(independent);
				const xValues = math.linspace(iMin, iMax, 50);
				const regressionData = xValues.map((x) => [x, regressionLine(x)]);

				return {
					result: regression,
					chartOptions: {
						xAxis: {
							type: "value",
							name: features.independent,
							axisTick: { show: false },
							min: "dataMin",
							max: "dataMax",
						},
						yAxis: {
							type: "value",
							name: features.dependent,
							axisTick: { show: false },
							min: "dataMin",
							max: "dataMax",
						},
						tooltip: { trigger: "axis" },
						series: [
							{ symbolSize: 10, data: pairs, type: "scatter" },
							{ type: "line", data: regressionData, showSymbol: false },
						],
					},
				};
			},
		}),
		tool({
			name: "count",
			parameters: z.object({}),
			description: "Find the total count of records in the dataset.",
			execute: () => ({ result: { length: dataset.length } }),
		}),
		tool({
			name: "describe",
			description:
				"Calculate descriptive statistics (mean, median, mode, min, max, quartiles, standard deviation, total) for a given feature.",
			parameters: z.object({ feature: AnyFeatureSchema }),
			execute: ({ feature }) => {
				const count = dataset.length;
				const values = toArray(dataset, feature);

				const mean = stats.mean(values);
				const median = stats.median(values);
				const mode = stats.mode(values);
				const standardDeviation = stats.standardDeviation(values);
				const total = stats.sum(toArray(dataset, feature));
				const uniqueCount = new Set(values).size;

				const q1 = stats.quantile(values, 0.25);
				const q3 = stats.quantile(values, 0.75);
				const min = stats.min(values);
				const max = stats.max(values);

				return {
					result: {
						count,
						mean,
						median,
						mode,
						min,
						max,
						q1,
						q3,
						standardDeviation,
						total,
						uniqueCount,
					},
					chartOptions: {
						xAxis: {
							type: "value",
							axisTick: { show: false },
							splitLine: { show: true },
							min: "dataMin",
							max: "dataMax",
						},
						yAxis: {
							type: "category",
							data: [feature],
							axisTick: { show: false },
							axisLine: { show: false },
						},
						tooltip: {},
						legend: {},
						series: [
							{
								name: "Distribution",
								type: "boxplot",
								data: [[min, q1, median, q3, max]],
								boxWidth: ["20%", "30%"],
							},
							{
								name: "68% Range (±1σ)",
								type: "line",
								data: [
									[mean - standardDeviation, -0.1],
									[mean + standardDeviation, -0.1],
								],
								lineStyle: { type: "dashed", opacity: 0.7 },
							},
							{
								name: "Mode",
								type: "scatter",
								data: [[mode, 0]],
								symbolSize: 12,
								symbol: "diamond",
							},
							{
								name: "Mean",
								type: "scatter",
								data: [[mean, 0]],
								symbolSize: 14,
								symbol: "circle",
							},
						],
					},
				};
			},
		}),
		tool({
			name: "percentile",
			description: "Find a percentile for a given feature.",
			parameters: z.object({
				feature: AnyFeatureSchema,
				percentile: z.number(),
			}),
			execute: ({ feature, percentile }) => {
				const values = toArray(dataset, feature);
				return {
					result: { percentile: stats.quantile(values, percentile / 100) },
				};
			},
		}),
		tool({
			name: "correlation",
			description: "Calculate sample correlation between two features.",
			parameters: z.object({
				features: z.object({ x: AnyFeatureSchema, y: AnyFeatureSchema }),
			}),
			execute: ({ features }) => {
				const x = toArray(dataset, features.x);
				const y = toArray(dataset, features.y);

				return { result: { correlation: stats.sampleCorrelation(x, y) } };
			},
		}),
	];

	const agent = new Agent({
		name: "Data Analyst",
		instructions:
			instructions + toCodeBlock("json", JSON.stringify(dataset.slice(0, 10))),
		tools,
		model: "gpt-4.1-mini",
		handoffDescription:
			"This agent has access to the user's data and can run a variety of statistical analyses on it.",
	});

	return agent;
};
