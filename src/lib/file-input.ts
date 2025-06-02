import { toCodeBlock } from "./md/to-code-block";
import * as ai from "@/lib/ai";
import * as mime from "@/lib/mime";
import type { ResponseInputContent } from "openai/resources/responses/responses.mjs";

export const fileInput = async (files: File[]) => {
	const inputs: ResponseInputContent[] = [];

	const handleFile = async (file: File) => {
		if (file.type === "application/pdf") {
			const upload = await ai.openai.files.create({
				file,
				purpose: "user_data",
			});

			inputs.push({
				type: "input_file",
				file_id: upload.id,
				filename: file.name,
			});
		} else if (mime.types.image.includes(file.type)) {
			const upload = await ai.openai.files.create({ file, purpose: "vision" });

			inputs.push({ type: "input_image", file_id: upload.id, detail: "auto" });
		} else if (file.type === mime.types.docx) {
			try {
				const [mammoth, arrayBuffer] = await Promise.all([
					import("mammoth/mammoth.browser.js"),
					file.arrayBuffer(),
				]);

				const { value } = await mammoth.extractRawText({ arrayBuffer });

				inputs.push({
					type: "input_text",
					text: `**${file.name}**\n\n${value}`,
				});
			} catch (error) {
				inputs.push({
					type: "input_text",
					text: "Failed to convert docx file.",
				});
			}
		} else {
			// fallback to text
			inputs.push({
				type: "input_text",
				text: `**${file.name}**\n\n${toCodeBlock(file.name.split(".").at(-1), await file.text())}`,
			});
		}
	};

	await Promise.all(files.map((file) => handleFile(file)));

	return inputs;
};
