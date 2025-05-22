import * as ai from "@/lib/ai";

export const generateTitle = async (message: string) => {
	const res = await ai.openai.responses.create({
		model: ai.fastestModel.name,
		input: `Create a title (<5 words) for this message:\n\n${message}`,
	});

	return res.output_text;
};
