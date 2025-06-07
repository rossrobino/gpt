import instructions from "@/lib/ai/agents/title/instructions.md?raw";
import { Agent } from "@openai/agents";

export const agent = new Agent({
	name: "Title Generator",
	instructions,
	model: "gpt-4.1-nano",
});
