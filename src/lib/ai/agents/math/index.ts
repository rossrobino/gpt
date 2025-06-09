import instructions from "@/lib/ai/agents/math/instructions.md?raw";
import katex from "@/lib/ai/agents/math/katex.md?raw";
import * as math from "@/lib/math";
import type { FunctionOutput } from "@/lib/types";
import { tool, Agent } from "@openai/agents";
import * as stats from "simple-statistics";
import * as z from "zod";

export const create = () =>
	new Agent({
		name: "Mathematician",
		instructions: instructions + katex,
		model: "gpt-4.1-mini",
		handoffDescription: "Has access to the tools to do math precisely.",
		tools: [
			tool({
				name: "sum",
				description: "Add numbers with precision.",
				parameters: z.object({ numbers: z.array(z.number()) }),
				execute: ({ numbers }): FunctionOutput => ({
					result: stats.sum(numbers),
				}),
			}),
			tool({
				name: "difference",
				description: "Subtract numbers with precision.",
				parameters: z.object({ numbers: z.array(z.number()) }),
				execute: ({ numbers }): FunctionOutput => ({
					result: math.difference(numbers),
				}),
			}),
			tool({
				name: "product",
				description: "Multiply numbers with precision.",
				parameters: z.object({ numbers: z.array(z.number()) }),
				execute: ({ numbers }): FunctionOutput => ({
					result: stats.product(numbers),
				}),
			}),
			tool({
				name: "quotient",
				description: "Divide numbers with precision.",
				parameters: z.object({ numbers: z.array(z.number()) }),
				execute: ({ numbers }): FunctionOutput => ({
					result: math.quotient(numbers),
				}),
			}),
		],
	});
