import * as ai from "@/lib/ai";
import * as schema from "@/lib/schema";
import type { ResponseInputContent } from "openai/resources/responses/responses.mjs";

const supportedImages = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export const fileInput = async (data: FormData) => {
	const files = schema.FilesSchema.parse(data.getAll("files"));
	const directory = schema.FilesSchema.parse(data.getAll("directory"));

	files.push(...directory);

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
				} else if (supportedImages.includes(file.type)) {
					const upload = await ai.openai.files.create({
						file,
						purpose: "vision",
					});

					return { type: "input_image", file_id: upload.id, detail: "auto" };
				}

				// fallback to text
				return {
					type: "input_text",
					text: `${file.name}\n\`\`\`${file.name.split(".").at(-1)}\n${await file.text()}\n\`\`\`\n`,
				};
			}),
	);
};
