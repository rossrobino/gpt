import * as ai from "@/lib/ai";
import { toCodeBlock } from "@/lib/md/util";
import * as mime from "@/lib/mime";
import type { AgentInputItem } from "@openai/agents-core";

export const fileInput = async (files: File[]) => {
	const input: AgentInputItem[] = [];

	const handleFile = async (file: File) => {
		if (file.type === "application/pdf") {
			const upload = await ai.openai.files.create({
				file,
				purpose: "user_data",
			});

			input.push({
				role: "user",
				content: [{ type: "input_file", file: upload }],
			});
		} else if (mime.types.image.includes(file.type)) {
			const upload = await ai.openai.files.create({ file, purpose: "vision" });

			input.push({
				role: "user",
				content: [{ type: "input_image", image: upload }],
			});
		} else if (file.type === mime.types.docx) {
			const [mammoth, arrayBuffer] = await Promise.all([
				import("mammoth/mammoth.browser.js"),
				file.arrayBuffer(),
			]);

			const { value } = await mammoth.extractRawText({ arrayBuffer });

			input.push({ role: "user", content: `**${file.name}**\n\n${value}` });
		} else {
			// fallback to text
			input.push({
				role: "user",
				content: `**${file.name}**\n\n${toCodeBlock(file.name.split(".").at(-1), await file.text())}`,
			});
		}
	};

	await Promise.all(files.map((file) => handleFile(file)));

	return input;
};
