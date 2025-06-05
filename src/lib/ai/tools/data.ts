import type { GenerateOptions } from "..";
import * as tools from "@/lib/ai/tools";
import * as math from "@/lib/math";
import { toCodeBlock } from "@/lib/md/util";
import * as schema from "@/lib/schema";
import type { Dataset } from "@/lib/types";
import * as stats from "simple-statistics";

const toArray = (dataset: Record<string, unknown>[], feature: string) => {
	return schema
		.array(schema.number())
		.parse(dataset.map((record) => record[feature]));
};

export const data = (dataset: NonNullable<Dataset>): GenerateOptions => {
	const firstRecord = dataset.at(0);

	const allFeatures: string[] = [];
	if (firstRecord) allFeatures.push(...Object.keys(firstRecord));

	const AnyFeatureSchema = schema.enum(allFeatures);

	const toolHelpers = [
		// tools.helper({
		// 	name: "sum",
		// 	description: "Add numbers with precision.",
		// 	ArgsSchema: schema.object({ numbers: schema.array(schema.number()) }),
		// 	execute: async ({ numbers }) => ({ result: stats.sum(numbers) }),
		// }),
		// tools.helper({
		// 	name: "difference",
		// 	description: "Subtract numbers with precision.",
		// 	ArgsSchema: schema.object({ numbers: schema.array(schema.number()) }),
		// 	execute: async ({ numbers }) => ({ result: math.difference(numbers) }),
		// }),
		// tools.helper({
		// 	name: "product",
		// 	description: "Multiply numbers with precision.",
		// 	ArgsSchema: schema.object({ numbers: schema.array(schema.number()) }),
		// 	execute: async ({ numbers }) => ({ result: stats.product(numbers) }),
		// }),
		// tools.helper({
		// 	name: "quotient",
		// 	description: "Divide numbers with precision.",
		// 	ArgsSchema: schema.object({ numbers: schema.array(schema.number()) }),
		// 	execute: async ({ numbers }) => ({ result: math.quotient(numbers) }),
		// }),
		tools.tool({
			name: "linear_regression",
			description: "Run a linear regression on data with relevant features.",
			parameters: schema.object({
				features: schema.object({
					dependent: AnyFeatureSchema,
					independent: AnyFeatureSchema, // could be multiple if multiple regression in the future
				}),
			}),
			execute: async ({ features }) => {
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
		tools.tool({
			name: "count",
			parameters: schema.object(),
			description: "Find the total count of records in the dataset.",
			execute: async () => ({ result: { length: dataset.length } }),
		}),
		tools.tool({
			name: "describe",
			description:
				"Calculate descriptive statistics (mean, median, mode, min, max, quartiles, standard deviation, total) for a given feature.",
			parameters: schema.object({ feature: AnyFeatureSchema }),
			execute: async ({ feature }) => {
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
		tools.tool({
			name: "percentile",
			description: "Find a percentile for a given feature.",
			parameters: schema.object({
				feature: AnyFeatureSchema,
				percentile: schema.int(),
			}),
			execute: async ({ feature, percentile }) => {
				const values = toArray(dataset, feature);
				return {
					result: { percentile: stats.quantile(values, percentile / 100) },
				};
			},
		}),
		tools.tool({
			name: "correlation",
			description: "Calculate sample correlation between two features.",
			parameters: schema.object({
				features: schema.object({ x: AnyFeatureSchema, y: AnyFeatureSchema }),
			}),
			execute: async ({ features }) => {
				const x = toArray(dataset, features.x);
				const y = toArray(dataset, features.y);

				return { result: { correlation: stats.sampleCorrelation(x, y) } };
			},
		}),
	];

	return {
		toolHelpers,
		input: [
			{
				role: "user",
				content: `data sample:\n\n${toCodeBlock("json", JSON.stringify(dataset.slice(0, 10)))}`,
			},
		],
		instructions:
			"You are an expert data analyst, you determine which tool is best for task at hand. You don't need to explain, just quickly select the tool.",
		model: "gpt-4.1",
	};
};
