import * as svg from "@/ui/svg";
import type * as echarts from "echarts";
import { escape } from "ovr";

export const Chart = (props: { options: echarts.EChartsOption }) => {
	// props.options.color = [
	// 	"#2a7392",
	// 	"#cb304a",
	// 	"rgb(68 78 96)",
	// 	"rgb(157 166 181)",
	// ];

	return (
		<p>
			<e-chart
				class="flex h-96 w-full flex-col items-center justify-center gap-2"
				options={escape(JSON.stringify(props.options), true)}
			>
				<svg.Chart class="text-foreground animate-pulse" />
				<noscript class="text-muted-foreground">
					JavaScript is required to view charts.
				</noscript>
			</e-chart>
		</p>
	);
};
