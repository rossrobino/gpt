import * as mime from "@/lib/mime";
import * as z from "zod/v4";

const DataSchema = z.array(
	z.record(z.string(), z.union([z.string(), z.number()])),
);

export const parseDataset = async (
	file: File | null,
	existing: string | null,
) => {
	let data: z.infer<typeof DataSchema> | null = null;

	if (!file?.size) {
		if (existing) {
			try {
				const parsed = DataSchema.parse(JSON.parse(existing));
				return parsed;
			} catch (error) {
				console.error(error);
			}
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

		data = DataSchema.safeParse(csvResult.data).data ?? null;
	} else if (file.type === mime.types.json) {
		const fileText = await file.text();
		try {
			data = DataSchema.safeParse(JSON.parse(fileText)).data ?? null;
		} catch (error) {
			console.error("Unable to parse data", error);
		}
	}

	return data;
};
