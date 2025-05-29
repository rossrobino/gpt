import * as ai from "@/lib/ai";
import * as schema from "@/lib/schema";
import type { ResponseInputContent } from "openai/resources/responses/responses.mjs";

const mime = {
	image: ["image/png", "image/jpeg", "image/webp", "image/gif"],
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const fileInput = async (data: FormData) => {
	const files = schema.FilesSchema.parse([
		...data.getAll("files"),
		...data.getAll("directory"),
	]);

	if (!files.length) return [];

	const input = await Promise.all(
		files
			.filter((file) => file.size)
			.map(async (file): Promise<ResponseInputContent> => {
				if (file.type === "application/pdf") {
					const upload = await ai.openai.files.create({
						file,
						purpose: "user_data",
					});

					return { type: "input_file", file_id: upload.id };
				} else if (mime.image.includes(file.type)) {
					const upload = await ai.openai.files.create({
						file,
						purpose: "vision",
					});

					return { type: "input_image", file_id: upload.id, detail: "auto" };
				} else if (file.type === mime.docx) {
					try {
						const [mammoth, arrayBuffer] = await Promise.all([
							import("mammoth/mammoth.browser.js"),
							file.arrayBuffer(),
						]);

						const { value } = await mammoth.extractRawText({ arrayBuffer });

						return { type: "input_text", text: `**${file.name}**\n\n${value}` };
					} catch (error) {
						return { type: "input_text", text: "Failed to convert docx file." };
					}
				}

				// fallback to text
				return {
					type: "input_text",
					text: `**${file.name}**\n\n\`\`\`${file.name.split(".").at(-1)}\n${await file.text()}\n\`\`\`\n`,
				};
			}),
	);

	return input;
};
