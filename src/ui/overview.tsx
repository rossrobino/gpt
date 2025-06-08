import { html } from "@/content/info.md";
import * as triage from "@/lib/ai/agents/triage";
import { Popover } from "@/ui/popover";
import * as svg from "@/ui/svg";
import { Agent } from "@openai/agents";

export const Overview = () => (
	<>
		<Popover title="Overview" trigger={{ children: svg.Info }}>
			{html}
			<h2 class="text-2xl">Agents</h2>
			<div class="grid gap-2">
				{triage.agent.handoffs.map((agent, i) => {
					if (agent instanceof Agent) {
						return <AgentInfo agent={agent} index={i} />;
					}
				})}
			</div>
		</Popover>
	</>
);

const AgentInfo = ({ agent, index }: { agent: Agent; index: number }) => {
	return (
		<div class="border-muted rounded-md border p-3">
			<div class="flex items-center gap-2 font-mono">
				<div class="text-xl">00{index}</div>
				<h3 class="text-base-500 my-0 text-xl font-normal lowercase">
					{agent.name}
				</h3>
			</div>
			<p class="mt-1 mb-0">{agent.handoffDescription}</p>
			{Boolean(agent.tools.length) && (
				<div class="mt-3 flex gap-2">
					{agent.tools.map((tool) => {
						return <div class="badge secondary inline-flex">{tool.name}()</div>;
					})}
				</div>
			)}
		</div>
	);
};
