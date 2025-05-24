import { NullableStringSchema } from "./schema";
import * as ai from "@/lib/ai";

export const generateTitle = async (
	data: FormDataEntryValue | null,
	message: string,
) => {
	const title = NullableStringSchema.parse(data);

	if (title) return title;

	const res = await ai.openai.responses.create({
		model: ai.fastestModel.name,
		input: `Create a title (<5 words) for this message:\n\n${message}`,
	});

	return res.output_text;
};
