import * as svg from "@/ui/svg";

export const Handoff = (props: { agentName: string }) => {
	return (
		<>
			<p
				class="text-muted-foreground mb-6 flex items-center gap-2 font-mono lowercase"
				aria-label={`Using the ${props.agentName} agent.`}
			>
				<svg.User />
				{props.agentName}
			</p>
			{"\n\n"}
		</>
	);
};
