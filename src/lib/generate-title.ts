import { NullableStringSchema, StringSchema } from "./schema";
import * as ai from "@/lib/ai";
import { Context, escape } from "ovr";

export const generateTitle = async (data: FormData) => {
	const c = Context.get();
	return c.memo(gen)(data);
};

const gen = async (data: FormData) => {
	const title = NullableStringSchema.parse(data.get("title"));

	if (title) return title;

	const text = StringSchema.parse(data.get("text"));

	const res = await ai.openai.responses.create({
		model: ai.fastestModel.name,
		input: `Create a title (<5 words) for this message:\n\n${text}`,
	});

	return escape(res.output_text);
};
