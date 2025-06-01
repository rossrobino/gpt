import type * as echarts from "echarts";
import { escape } from "ovr";

export const Chart = (options: { options: echarts.EChartsOption }) => {
	return (
		<p>
			<e-chart
				class="border-muted block h-72 w-full rounded-md border"
				options={escape(JSON.stringify(options), true)}
			></e-chart>
		</p>
	);
};
