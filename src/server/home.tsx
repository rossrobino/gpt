import * as triage from "@/lib/ai/agents/triage";
import { Input } from "@/ui/input";
import { Agent } from "@openai/agents";
import * as ovr from "ovr";

export const page = new ovr.Page("/", (c) => {
	c.head(<title>AI6</title>);

	const agent = triage.create([{ home: 0 }]); // to populate agent info
	return <Input agents={agent.handoffs.filter((a) => a instanceof Agent)} />;
});
