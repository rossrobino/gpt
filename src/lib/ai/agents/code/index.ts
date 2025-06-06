import instructions from "@/lib/ai/agents/code/instructions.md?raw";
import { Agent } from "@openai/agents-core";

export const agent = new Agent({
	name: "Software Developer",
	model: "gpt-4.1-mini",
	instructions,
	handoffDescription:
		"This agent is good at software development / programming / coding.",
});
