import { Lifecycle } from "drab/base";
import type * as types from "echarts";
import * as charts from "echarts/charts";
import * as components from "echarts/components";
import * as core from "echarts/core";
import * as renderers from "echarts/renderers";

core.use([
	charts.BoxplotChart,
	charts.LineChart,
	charts.ScatterChart,
	components.TitleComponent,
	components.TooltipComponent,
	components.GridComponent,
	components.DatasetComponent,
	components.TransformComponent,
	components.LegendComponent,
	renderers.CanvasRenderer,
]);

class EChart extends Lifecycle() {
	get options() {
		const attr = this.getAttribute("options");

		if (!attr) throw new Error("Options not set.");

		return JSON.parse(attr) as types.EChartsOption;
	}

	override mount() {
		const chart = core.init(this);

		chart.setOption(this.options);

		const observer = new ResizeObserver(() => {
			chart.resize();
		});

		observer.observe(this);
	}
}

customElements.define("e-chart", EChart);
