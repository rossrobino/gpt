import { Lifecycle } from "drab/base";
import * as echarts from "echarts";

class EChart extends Lifecycle() {
	get options() {
		const attr = this.getAttribute("options");

		if (!attr) throw new Error("Options not set.");

		return JSON.parse(attr) as echarts.EChartsOption;
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
