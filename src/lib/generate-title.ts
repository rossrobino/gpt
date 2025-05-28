import * as ai from "@/lib/ai";
import * as schema from "@/lib/schema";
import { Context, escape } from "ovr";

export const generateTitle = (data: FormData) => {
	const c = Context.get();
	return c.memo(gen)(data);
};

const gen = async (data: FormData) => {
	const title = schema.NullableStringSchema.parse(data.get("title"));

	if (title) return title;

	const text = schema.StringSchema.parse(data.get("text"));

	const res = await ai.openai.responses.create({
		model: ai.fastestModel.name,
		input: `Create a title (<5 words) for this message:\n\n${text}`,
	});

	return escape(res.output_text);
};
