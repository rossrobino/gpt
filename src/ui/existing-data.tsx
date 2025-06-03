import type { Dataset } from "@/lib/types";
// import { Table } from "@/ui/table";
import { escape } from "ovr";

export const ExistingData = (props: { dataset: Dataset }) => {
	if (props.dataset) {
		return (
			<div class="mt-12">
				{/* <Table data={props.dataset} /> */}
				<input
					type="hidden"
					value={escape(JSON.stringify(props.dataset), true)}
					name="existing-dataset"
				></input>
			</div>
		);
	}
};
