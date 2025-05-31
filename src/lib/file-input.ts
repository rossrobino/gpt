import * as ai from "@/lib/ai";
import type { ResponseInputContent } from "openai/resources/responses/responses.mjs";

const mime = {
	image: ["image/png", "image/jpeg", "image/webp", "image/gif"],
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" as const,
	csv: "text/csv" as const,
};

export const fileInput = async ({ files }: { files: File[] }) => {
	const fileInputs: ResponseInputContent[] = [];
	const datasets: unknown[] = [];
	// const fn: (ResponseInputItem.FunctionCallOutput | ResponseOutputItem)[] = [];

	const handleFile = async (file: File) => {
		if (file.type === "application/pdf") {
			const upload = await ai.openai.files.create({
				file,
				purpose: "user_data",
			});

			fileInputs.push({ type: "input_file", file_id: upload.id });
		} else if (mime.image.includes(file.type)) {
			const upload = await ai.openai.files.create({ file, purpose: "vision" });

			fileInputs.push({
				type: "input_image",
				file_id: upload.id,
				detail: "auto",
			});
		} else if (file.type === mime.docx) {
			try {
				const [mammoth, arrayBuffer] = await Promise.all([
					import("mammoth/mammoth.browser.js"),
					file.arrayBuffer(),
				]);

				const { value } = await mammoth.extractRawText({ arrayBuffer });

				fileInputs.push({
					type: "input_text",
					text: `**${file.name}**\n\n${value}`,
				});
			} catch (error) {
				fileInputs.push({
					type: "input_text",
					text: "Failed to convert docx file.",
				});
			}
		} else if (file.type === mime.csv) {
			const [{ default: csv }, fileText] = await Promise.all([
				import("papaparse"),
				file.text(),
			]);

			const csvResult = csv.parse(fileText, {
				skipEmptyLines: true,
				dynamicTyping: true,
				header: true,
			});

			datasets.push(csvResult.data);
		} else {
			// fallback to text
			fileInputs.push({
				type: "input_text",
				text: `**${file.name}**\n\n\`\`\`${file.name.split(".").at(-1)}\n${await file.text()}\n\`\`\`\n`,
			});
		}
	};

	await Promise.all(files.map((file) => handleFile(file)));

	return { fileInputs, datasets };
};
