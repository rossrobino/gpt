import { Lifecycle } from "drab/base";
import * as echarts from "echarts";

class EChart extends Lifecycle() {
	get options() {
		const attr = this.getAttribute("options");

		if (!attr) throw new Error("Options not set.");

		return JSON.parse(attr).options as echarts.EChartsOption;
	}

	override mount() {
		const chart = echarts.init(this);

		console.log(this.options);

		chart.setOption(this.options);
	}
}

customElements.define("e-chart", EChart);
