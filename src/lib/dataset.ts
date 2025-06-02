import * as mime from "@/lib/mime";
import * as schema from "@/lib/schema";
import type { Dataset } from "@/lib/types";

export const parseDataset = async (
	file: File | null,
	existing: string | null,
) => {
	let data: Dataset = null;

	try {
		if (!file?.size) {
			if (existing) {
				data = schema.DataSchema.parse(JSON.parse(existing));
			}
		} else if (file.type === mime.types.csv) {
			const [{ default: csv }, fileText] = await Promise.all([
				import("papaparse"),
				file.text(),
			]);

			const csvResult = csv.parse(fileText, {
				skipEmptyLines: true,
				dynamicTyping: true,
				header: true,
			});

			data = schema.DataSchema.safeParse(csvResult.data).data ?? null;
		} else if (file.type === mime.types.json) {
			const fileText = await file.text();
			data = schema.DataSchema.safeParse(JSON.parse(fileText)).data ?? null;
		}
	} catch (error) {
		console.error("Unable to parse data.", error);
	}
	return data;
};
