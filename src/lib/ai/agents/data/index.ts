import instructions from "@/lib/ai/agents/data/instructions.md?raw";
import { linspace } from "@/lib/math";
import * as z from "@/lib/schema";
import type { Dataset, FunctionOutput } from "@/lib/types";
import { tool, Agent } from "@openai/agents";
import * as stats from "simple-statistics";
import * as z3 from "zod";

const toNumberArray = (dataset: Dataset, feature: string) =>
	z.array(z.number()).parse(dataset?.map((record) => record[feature]));

export const create = (dataset: Dataset) => {
	const agent = new Agent({
		name: "Data Scientist",
		instructions,
		model: "gpt-4.1-mini",
		handoffDescription:
			"Ability access to the user's dataset and run a variety of statistical analyses using it.",
	});

	if (!dataset) return agent;

	const count = dataset.length;
	const keys = Object.keys(dataset.at(0) ?? {});
	const [first, ...rest] = keys;

	if (!first) return agent;

	const AnyFeatureSchema = z3.enum([first, ...rest]);

	agent.tools.push(
		tool({
			name: "linear_regression",
			description: "Run a linear regression on data with relevant features.",
			parameters: z3.object({
				features: z3.object({
					dependent: AnyFeatureSchema,
					independent: AnyFeatureSchema, // could be multiple if multiple regression in the future
				}),
			}),
			execute: ({ features }): FunctionOutput => {
				const independent = toNumberArray(dataset, features.independent);
				const dependent = toNumberArray(dataset, features.dependent);

				const pairs = independent.map((x, i) => [x, dependent[i]!]);
				const regression = stats.linearRegression(pairs);
				const regressionLine = stats.linearRegressionLine(regression);
				const xValues = linspace(
					stats.min(independent),
					stats.max(independent),
					50,
				);
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
			name: "describe",
			description:
				"Calculate descriptive statistics (mean, median, mode, min, max, quartiles, standard deviation, total) for a given feature.",
			parameters: z3.object({ feature: AnyFeatureSchema }),
			execute: ({ feature }): FunctionOutput => {
				const values = toNumberArray(dataset, feature);

				const mean = stats.mean(values);
				const median = stats.median(values);
				const mode = stats.mode(values);
				const standardDeviation = stats.standardDeviation(values);
				const total = stats.sum(toNumberArray(dataset, feature));
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
								itemStyle: { color: "transparent" },
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
			parameters: z3.object({
				feature: AnyFeatureSchema,
				percentile: z3.number(),
			}),
			execute: ({ feature, percentile }): FunctionOutput => {
				const values = toNumberArray(dataset, feature);

				const sorted = values.slice().sort((a, b) => a - b);

				const p = stats.quantileSorted(sorted, percentile / 100);

				const binCount = 20;
				const breaks = stats.equalIntervalBreaks(sorted, binCount);
				const bins = Array(binCount).fill(0);
				sorted.forEach((v) => {
					for (let i = 0; i < binCount; i++) {
						const lo = breaks[i]!,
							hi = breaks[i + 1]!;
						if (
							(i === binCount - 1 && v >= lo && v <= hi) ||
							(v >= lo && v < hi)
						) {
							bins[i]++;
							break;
						}
					}
				});

				const histogramData = breaks.slice(0, -1).map((b, i) => [b, bins[i]]);
				const yMax = Math.max(...bins);

				return {
					result: { p },
					chartOptions: {
						xAxis: {
							type: "value",
							name: feature,
							min: "dataMin",
							max: "dataMax",
						},
						yAxis: { type: "value", name: "Frequency" },
						tooltip: { trigger: "axis" },
						series: [
							{ name: "Histogram", type: "bar", data: histogramData },
							{
								name: `${percentile}th %ile`,
								type: "line",
								data: [
									[p, 0],
									[p, yMax],
								],
								lineStyle: { type: "dashed", width: 3 },
								showSymbol: false,
							},
						],
					},
				};
			},
		}),
		tool({
			name: "correlation",
			description: "Calculate sample correlation between two features.",
			parameters: z3.object({
				features: z3.object({ x: AnyFeatureSchema, y: AnyFeatureSchema }),
			}),
			execute: ({ features }): FunctionOutput => {
				const x = toNumberArray(dataset, features.x);
				const y = toNumberArray(dataset, features.y);

				return { result: { correlation: stats.sampleCorrelation(x, y) } };
			},
		}),
		tool({
			name: "remove_duplicates",
			description:
				"Remove duplicate records based on specified features. If no features are given, all fields will be used as the key.",
			needsApproval: true,
			parameters: z3.object({
				features: z3.array(AnyFeatureSchema).nullable(),
			}),
			execute: ({ features }): FunctionOutput => {
				const fields = features ?? keys;
				const seen = new Set<string>();
				let write = 0;

				// read-copy back into dataset
				for (let read = 0; read < count; read++) {
					const record = dataset[read]!;
					const composite = fields.map((f) => record[f]).join("||");
					if (!seen.has(composite)) {
						seen.add(composite);
						dataset[write++] = record;
					}
				}

				dataset.length = write; // truncate in place

				return { result: { removed: count - write, remaining: write } };
			},
		}),
		tool({
			name: "drop_missing",
			description:
				"Remove any rows where one or more specified features are null, undefined or NaN. If no features are given, any record with missing data will be removed.",
			needsApproval: true,
			parameters: z3.object({
				features: z3.array(AnyFeatureSchema).nullable(),
			}),
			execute: ({ features }) => {
				const fields = features ?? keys;
				let write = 0;

				for (let read = 0; read < count; read++) {
					const record = dataset[read]!;
					const hasMissing = fields.some(
						(col) =>
							record[col] == null ||
							(typeof record[col] === "number" && Number.isNaN(record[col])),
					);

					if (!hasMissing) dataset[write++] = record;
				}

				dataset.length = write;

				return { result: { removed: count - write, remaining: write } };
			},
		}),
		tool({
			name: "impute_missing",
			description:
				"Impute missing values for specified features using a given strategy. Strategies: mean, median, mode, constant. If no features are given, all features will be imputed.",
			parameters: z3.object({
				features: z3.array(AnyFeatureSchema).nullable(),
				strategy: z3
					.enum(["mean", "median", "mode", "constant"])
					.default("mean"),
				constant: z3.number().nullable().optional(),
			}),
			needsApproval: true,
			execute: ({ features, strategy, constant }) => {
				const fields = features ?? keys;

				const imputed: Record<string, number> = {};
				let totalImputed = 0;
				const perFeatureCount: Record<string, number> = {};

				for (const field of fields) {
					perFeatureCount[field] = 0; // init

					const numbers = dataset
						.map((r) => r[field])
						.filter(
							(v) => typeof v === "number" && !Number.isNaN(v),
						) as number[];

					if (strategy === "mean") {
						imputed[field] = stats.mean(numbers);
					} else if (strategy === "median") {
						imputed[field] = stats.median(numbers);
					} else if (strategy === "mode") {
						imputed[field] = stats.mode(numbers);
					} else {
						// constant
						if (constant == null) {
							throw Error(
								"You must provide `constant` when strategy is 'constant'",
							);
						}

						imputed[field] = constant;
					}
				}

				for (let i = 0; i < dataset.length; i++) {
					const record = dataset[i]!;

					for (const field of fields) {
						const value = record[field];

						if (
							value == null ||
							(typeof value === "number" && Number.isNaN(value))
						) {
							record[field] = imputed[field]!;
							perFeatureCount[field]!++;
							totalImputed++;
						}
					}
				}

				return { result: { totalImputed, perFeatureCount, imputed } };
			},
		}),
	);

	return agent;
};
