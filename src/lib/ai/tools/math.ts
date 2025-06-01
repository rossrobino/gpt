import * as tools from "@/lib/ai/tools";
import * as z from "zod/v4";

export const add = (numbers: number[]) =>
	numbers.reduce((arr, curr) => arr + curr, 0);
export const subtract = (numbers: number[]) =>
	numbers.length === 0
		? 0
		: numbers.slice(1).reduce((acc, curr) => acc - curr, numbers[0]!);
export const multiply = (numbers: number[]) =>
	numbers.reduce((arr, curr) => arr * curr, 0);
export const divide = (numbers: number[]) =>
	numbers.length === 0
		? 0
		: numbers.slice(1).reduce((acc, curr) => acc / curr, numbers[0]!);

export const math = () => {
	const helpers = [
		tools.helper({
			name: "add",
			description: "Add numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => ({ result: add(numbers) }),
		}),
		tools.helper({
			name: "subtract",
			description: "Subtract numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => ({ result: subtract(numbers) }),
		}),
		tools.helper({
			name: "multiply",
			description: "Multiply numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => ({ result: multiply(numbers) }),
		}),
		tools.helper({
			name: "divide",
			description: "Divide numbers with precision.",
			ArgsSchema: z.object({ numbers: z.array(z.number()) }),
			run: ({ numbers }) => ({ result: divide(numbers) }),
		}),
	];

	return { helpers };
};
