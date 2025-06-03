import type { Dataset } from "@/lib/types";
// import { Table } from "@/ui/table";
import * as ovr from "ovr";

export const ExistingData = (props: { dataset: Dataset }) => {
	if (props.dataset) {
		return (
			<div class="mt-12">
				{/* <Table data={props.dataset} /> */}
				<input
					type="hidden"
					value={ovr.escape(JSON.stringify(props.dataset), true)}
					name="existing"
				></input>
			</div>
		);
	}
};
