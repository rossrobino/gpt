import instructions from "@/lib/ai/agents/code/instructions.md?raw";
import { Agent } from "@openai/agents-core";

export const create = () =>
	new Agent({
		name: "Software Developer",
		model: "gpt-4.1-mini",
		instructions,
		handoffDescription: "Excellent at programming and coding.",
	});
