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
				execute: ({ numbers }): FunctionOutput => {
					return { result: stats.product(numbers) };
				},
			}),
			tool({
				name: "quotient",
				description: "Divide numbers with precision.",
				parameters: z.object({ numbers: z.array(z.number()) }),
				execute: ({ numbers }): FunctionOutput => {
					return { result: math.quotient(numbers) };
				},
			}),
			tool({
				name: "square_root",
				description: "Find the square root of a number.",
				parameters: z.object({ number: z.number() }),
				execute: ({ number }): FunctionOutput => {
					Math.pow;
					return { result: Math.sqrt(number) };
				},
			}),
			tool({
				name: "cube_root",
				description: "Find the cube root of a number.",
				parameters: z.object({ number: z.number() }),
				execute: ({ number }): FunctionOutput => {
					return { result: Math.cbrt(number) };
				},
			}),
			tool({
				name: "power",
				description:
					"Returns the number taken to a specified power. For example, to square a number, pass in a `power` of 2.",
				parameters: z.object({ number: z.number(), power: z.number() }),
				execute: ({ number, power }): FunctionOutput => {
					return { result: Math.pow(number, power) };
				},
			}),
			tool({
				name: "sine",
				description: "Find the sine of a number.",
				parameters: z.object({ number: z.number() }),
				execute: ({ number }): FunctionOutput => {
					return { result: Math.sin(number) };
				},
			}),
			tool({
				name: "cosine",
				description: "Find the cosine of a number.",
				parameters: z.object({ number: z.number() }),
				execute: ({ number }): FunctionOutput => {
					return { result: Math.cos(number) };
				},
			}),
			tool({
				name: "tangent",
				description: "Find the tangent of a number.",
				parameters: z.object({ number: z.number() }),
				execute: ({ number }): FunctionOutput => {
					return { result: Math.tan(number) };
				},
			}),
		],
	});
