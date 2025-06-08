import { Agent, webSearchTool } from "@openai/agents";

export const agent = new Agent({
	name: "Assistant",
	model: "gpt-4.1-mini",
	handoffDescription:
		"This agent should be the default, it is a generalist who has access to the web.",
	tools: [webSearchTool()],
});
