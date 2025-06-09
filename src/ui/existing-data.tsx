import { Details } from "./details";
import type { Dataset } from "@/lib/types";
import { Table } from "@/ui/table";
import * as ovr from "ovr";

export const ExistingData = (props: { dataset: Dataset }) => {
	if (props.dataset) {
		return (
			<div class="mt-12">
				{function* () {
					yield (
						<Details summary="Data">
							<Table data={props.dataset!} />
						</Details>
					);
					yield (
						<input
							type="hidden"
							value={ovr.escape(JSON.stringify(props.dataset), true)}
							name="existing"
						></input>
					);
				}}
			</div>
		);
	}
};
