import * as assistant from "@/lib/ai/agents/assistant";
import * as code from "@/lib/ai/agents/code";
import * as math from "@/lib/ai/agents/math";
import { Agent } from "@openai/agents";
import { promptWithHandoffInstructions } from "@openai/agents-core/extensions";

export const agent = Agent.create({
	name: "Triage",
	instructions: promptWithHandoffInstructions(
		"You are a router that QUICKLY determines the best agent to handoff to. Each agent has access to a variety of tools and data to answer questions that you might not have access to.",
	),
	model: "gpt-4.1-mini",
	handoffs: [assistant.agent, code.agent, math.agent],
});
