import * as format from "@/lib/format";
import * as mime from "@/lib/mime";
import * as z from "@/lib/schema";
import type { Dataset } from "@/lib/types";
import type { AgentInputItem } from "@openai/agents-core";

export const parseDataset = async (
	file: File | null,
	existing: string | null,
) => {
	let dataset: Dataset = null;
	const dataInput: AgentInputItem[] = [];

	if (existing) dataset = z.data().parse(JSON.parse(existing));

	// file takes precedence to existing data
	if (file) {
		if (mime.types.csv.includes(file.type)) {
			const [{ default: csv }, fileText] = await Promise.all([
				import("papaparse"),
				file.text(),
			]);

			const csvResult = csv.parse(fileText, {
				skipEmptyLines: true,
				dynamicTyping: true,
				header: true,
			});

			dataset = z.data().parse(csvResult.data);
		} else if (file.type === mime.types.json) {
			const fileText = await file.text();
			dataset = z.data().parse(JSON.parse(fileText));
		}

		if (dataset) {
			// New dataset added
			dataInput.push({
				role: "system",
				content: `_Dataset added, sample:_\n\n${format.toMdTable(dataset.slice(0, 6))}`,
			});
		}
	}

	return {
		/** Existing or new data. */
		dataset,

		/**
		 * Notify the system that a new dataset was added,
		 * helps if there is no input with the file.
		 */
		dataInput,
	};
};
