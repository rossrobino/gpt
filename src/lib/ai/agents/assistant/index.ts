import { Agent, webSearchTool } from "@openai/agents";

export const agent = new Agent({
	name: "Assistant",
	model: "gpt-4.1-mini",
	handoffDescription:
		"The Assistant is the default, a generalist who has access to the web.",
	tools: [webSearchTool()],
});
