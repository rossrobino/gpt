import * as ai from "@/lib/ai";
import type {
	ResponseInputContent,
	ResponseInputItem,
	ResponseOutputItem,
} from "openai/resources/responses/responses.mjs";

const mime = {
	image: ["image/png", "image/jpeg", "image/webp", "image/gif"],
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" as const,
	csv: "text/csv" as const,
};

export const fileInput = async ({
	files,
	text,
}: {
	files: File[];
	text: string;
}) => {
	const user: ResponseInputContent[] = [];
	const fn: (ResponseInputItem.FunctionCallOutput | ResponseOutputItem)[] = [];

	const handleFile = async (file: File) => {
		if (file.type === "application/pdf") {
			const upload = await ai.openai.files.create({
				file,
				purpose: "user_data",
			});

			user.push({ type: "input_file", file_id: upload.id });
		} else if (mime.image.includes(file.type)) {
			const upload = await ai.openai.files.create({ file, purpose: "vision" });

			user.push({ type: "input_image", file_id: upload.id, detail: "auto" });
		} else if (file.type === mime.docx) {
			try {
				const [mammoth, arrayBuffer] = await Promise.all([
					import("mammoth/mammoth.browser.js"),
					file.arrayBuffer(),
				]);

				const { value } = await mammoth.extractRawText({ arrayBuffer });

				user.push({ type: "input_text", text: `**${file.name}**\n\n${value}` });
			} catch (error) {
				user.push({ type: "input_text", text: "Failed to convert docx file." });
			}
		} else if (file.type === mime.csv) {
			const [{ default: csv }, { analyze }, fileText] = await Promise.all([
				import("papaparse"),
				import("@/lib/analyze"),
				file.text(),
			]);

			const csvResult = csv.parse(fileText, {
				header: true,
				skipEmptyLines: true,
				dynamicTyping: true,
			});

			const outputs = await analyze({ records: csvResult.data, text });

			fn.push(...outputs);
		} else {
			// fallback to text
			user.push({
				type: "input_text",
				text: `**${file.name}**\n\n\`\`\`${file.name.split(".").at(-1)}\n${await file.text()}\n\`\`\`\n`,
			});
		}
	};

	const promises: Promise<void>[] = [];

	for (const file of files) promises.push(handleFile(file));

	await Promise.all(promises);

	return { user, fn };
};
