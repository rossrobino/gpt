import { html } from "@/content/info.md";
import { Popover } from "@/ui/popover";
import * as svg from "@/ui/svg";

export const Overview = () => (
	<Popover title="Overview" trigger={{ children: svg.Info }}>
		<div class="grid gap-6">
			<div>{html}</div>
			<open-agents />
		</div>
	</Popover>
);
