import { Lifecycle } from "drab/base";
import type * as types from "echarts";
import { BoxplotChart, LineChart, ScatterChart } from "echarts/charts";
import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	DatasetComponent,
	TransformComponent,
	LegendComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
	BoxplotChart,
	LineChart,
	ScatterChart,
	TitleComponent,
	TooltipComponent,
	GridComponent,
	DatasetComponent,
	TransformComponent,
	LegendComponent,
	CanvasRenderer,
]);

class EChart extends Lifecycle() {
	get options() {
		const attr = this.getAttribute("options");

		if (!attr) throw new Error("Options not set.");

		return JSON.parse(attr) as types.EChartsOption;
	}

	override mount() {
		const chart = echarts.init(this);

		chart.setOption(this.options);

		const observer = new ResizeObserver(() => {
			chart.resize();
		});

		observer.observe(this);
	}
}

customElements.define("e-chart", EChart);
