import * as assistant from "@/lib/ai/agents/assistant";
import * as code from "@/lib/ai/agents/code";
import { Agent } from "@openai/agents";
import { promptWithHandoffInstructions } from "@openai/agents-core/extensions";

export const agent = Agent.create({
	name: "Triage Agent",
	instructions: promptWithHandoffInstructions(
		"You are a router that QUICKLY determines the best agent to handoff to. Each agent has access to a variety of tools to answer questions.",
	),
	handoffs: [assistant.agent, code.agent],
});
