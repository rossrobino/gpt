import * as triage from "@/lib/ai/agents/triage";
import { Popover } from "@/ui/popover";
import * as svg from "@/ui/svg";
import { Agent } from "@openai/agents";

export const Agents = (props: { agent?: Agent }) => {
	if (!props.agent) props.agent = triage.create([{ home: 0 }]); // to populate agent info

	return (
		<Popover title="Agents" trigger={{ children: svg.BookUser }}>
			<div class="grid gap-4">
				{props.agent.handoffs.map((agent, i) => {
					if (agent instanceof Agent) {
						return <AgentInfo agent={agent} index={i} />;
					}
				})}
			</div>
			<p class="text-muted-foreground mt-6 mb-0">
				Submit an idea for another agent or tool on{" "}
				<a href="https://github.com/rossrobino/ai6/issues/new">GitHub</a>.
			</p>
		</Popover>
	);
};

const AgentInfo = ({ agent, index }: { agent: Agent; index: number }) => {
	return (
		<div class="border-muted cursor-default rounded-md border p-4">
			<AgentNumberAndName agent={agent} index={index} />

			<p class="text-muted-foreground mt-2 mb-0">{agent.handoffDescription}</p>

			{Boolean(agent.tools.length) && (
				<div class="mt-3 flex flex-wrap gap-2">
					{agent.tools
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((tool) => {
							return <div class="badge secondary inline-flex">{tool.name}</div>;
						})}
				</div>
			)}
		</div>
	);
};

export const AgentNumberAndName = ({
	agent,
	index,
}: {
	agent: Agent;
	index: number;
}) => {
	return (
		<div class="flex cursor-default items-center gap-3 font-mono">
			<div class="text-xl">00{index}</div>
			<h2 class="text-base-500 my-0 text-xl font-normal lowercase">
				{agent.name}
			</h2>
		</div>
	);
};
