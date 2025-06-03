import * as mime from "@/lib/mime";
import * as schema from "@/lib/schema";
import type { Dataset } from "@/lib/types";

export const parseDataset = async (
	file: File | null,
	existing: string | null,
) => {
	let data: Dataset = null;

	try {
		if (!file) {
			if (existing) data = schema.data().parse(JSON.parse(existing));
		} else if (mime.types.csv.includes(file.type)) {
			const [{ default: csv }, fileText] = await Promise.all([
				import("papaparse"),
				file.text(),
			]);

			const csvResult = csv.parse(fileText, {
				skipEmptyLines: true,
				dynamicTyping: true,
				header: true,
			});

			data = schema.data().parse(csvResult.data);
		} else if (file.type === mime.types.json) {
			const fileText = await file.text();
			data = schema.data().parse(JSON.parse(fileText));
		}
	} catch (error) {
		console.error("Unable to parse data.", error);
	}

	return data;
};
