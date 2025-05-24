import { FilesSchema } from "./schema";
import * as ai from "@/lib/ai";
import type { ResponseInputContent } from "openai/resources/responses/responses.mjs";

export const fileInput = async (data: FormDataEntryValue[]) => {
	const files = FilesSchema.parse(data);

	return Promise.all(
		files
			.filter((file) => file.size)
			.map(async (file): Promise<ResponseInputContent> => {
				if (file.type === "application/pdf") {
					const upload = await ai.openai.files.create({
						file,
						purpose: "user_data",
					});

					return { type: "input_file", file_id: upload.id };
				}

				return {
					type: "input_text",
					text: `${file.name}\n\`\`\`${file.name.split(".").at(-1)}\n${await file.text()}\n\`\`\`\n`,
				};
			}),
	);
};
