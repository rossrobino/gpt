import * as ai from "@/lib/ai";
import { Context, escape } from "ovr";

export const generateTitle = (title: string | null, text: string | null) => {
	const c = Context.get();
	return c.memo(gen)(title, text);
};

const gen = async (title: string | null, text: string | null) => {
	if (title) return title;

	const res = await ai.openai.responses.create({
		model: ai.fastestModel.name,
		input: `Create a title (<5 words) for this message:\n\n${text}`,
	});

	return escape(res.output_text);
};
