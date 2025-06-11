import { Agent, webSearchTool } from "@openai/agents";

export const create = () =>
	new Agent({
		name: "Researcher",
		model: "gpt-4.1-mini",
		handoffDescription: "The Researcher has access to the internet.",
		tools: [webSearchTool()],
	});
