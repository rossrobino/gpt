import instructions from "@/lib/ai/agents/math/instructions.md?raw";
import katex from "@/lib/ai/agents/math/katex.md?raw";
import * as format from "@/lib/format";
import * as math from "@/lib/math";
import type { FunctionOutput } from "@/lib/types";
import { tool, Agent } from "@openai/agents";
import * as stats from "simple-statistics";
import * as z3 from "zod";

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
				parameters: z3.object({ numbers: z3.array(z3.number()) }),
				execute: ({ numbers }): FunctionOutput => {
					const result = stats.sum(numbers);
					return {
						result,
						summary: format.toKatexBlock(`${numbers.join(" + ")} = ${result}`),
					};
				},
			}),
			tool({
				name: "difference",
				description: "Subtract numbers with precision.",
				parameters: z3.object({ numbers: z3.array(z3.number()) }),
				execute: ({ numbers }): FunctionOutput => {
					const result = math.difference(numbers);
					return {
						result,
						summary: format.toKatexBlock(`${numbers.join(" - ")} = ${result}`),
					};
				},
			}),
			tool({
				name: "product",
				description: "Multiply numbers with precision.",
				parameters: z3.object({ numbers: z3.array(z3.number()) }),
				execute: ({ numbers }): FunctionOutput => {
					const result = stats.product(numbers);
					return {
						result,
						summary: format.toKatexBlock(`${numbers.join(" x ")} = ${result}`),
					};
				},
			}),
			tool({
				name: "quotient",
				description: "Divide numbers with precision.",
				parameters: z3.object({ numbers: z3.array(z3.number()) }),
				execute: ({ numbers }): FunctionOutput => {
					const result = math.quotient(numbers);
					return {
						result,
						summary: format.toKatexBlock(`${numbers.join(" / ")} = ${result}`),
					};
				},
			}),
			tool({
				name: "square_root",
				description: "Find the square root of a number.",
				parameters: z3.object({ number: z3.number() }),
				execute: ({ number }): FunctionOutput => {
					const result = Math.sqrt(number);
					return {
						result,
						summary: format.toKatexBlock(`\\sqrt{${number}} = ${result}`),
					};
				},
			}),
			tool({
				name: "cube_root",
				description: "Find the cube root of a number.",
				parameters: z3.object({ number: z3.number() }),
				execute: ({ number }): FunctionOutput => {
					const result = Math.cbrt(number);
					return {
						result,
						summary: format.toKatexBlock(`\\sqrt[3]{${number}} = ${result}`),
					};
				},
			}),
			tool({
				name: "power",
				description:
					"Returns the number taken to a specified power. For example, to square a number, pass in a `power` of 2.",
				parameters: z3.object({ number: z3.number(), power: z3.number() }),
				execute: ({ number, power }): FunctionOutput => {
					const result = Math.pow(number, power);
					return {
						result,
						summary: format.toKatexBlock(`${number}^${power} = ${result}`),
					};
				},
			}),
			tool({
				name: "sine",
				description: "Find the sine of a number.",
				parameters: z3.object({ number: z3.number() }),
				execute: ({ number }): FunctionOutput => {
					const result = Math.sin(number);
					return {
						result,
						summary: format.toKatexBlock(`\\sin(${number}) = ${result}`),
					};
				},
			}),
			tool({
				name: "cosine",
				description: "Find the cosine of a number.",
				parameters: z3.object({ number: z3.number() }),
				execute: ({ number }): FunctionOutput => {
					const result = Math.cos(number);
					return {
						result,
						summary: format.toKatexBlock(`\\cos(${number}) = ${result}`),
					};
				},
			}),
			tool({
				name: "tangent",
				description: "Find the tangent of a number.",
				parameters: z3.object({ number: z3.number() }),
				execute: ({ number }): FunctionOutput => {
					const result = Math.tan(number);
					return {
						result,
						summary: format.toKatexBlock(`\\tan(${number}) = ${result}`),
					};
				},
			}),
		],
	});
