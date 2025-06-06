import { Agent, webSearchTool } from "@openai/agents";

export const agent = new Agent({
	name: "Default Assistant",
	instructions: "You are a helpful assistant.",
	handoffDescription: "This agent is a generalist who has access to the web.",
	tools: [webSearchTool()],
});
