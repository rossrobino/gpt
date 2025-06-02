import type { Dataset } from "@/lib/types";
import { escape } from "ovr";

export const ExistingData = (props: { dataset: Dataset }) => {
	if (props.dataset) {
		return (
			<input
				type="hidden"
				value={escape(JSON.stringify(props.dataset), true)}
				name="existing-dataset"
			></input>
		);
	}
};
