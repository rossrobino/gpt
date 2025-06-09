import { create } from "@/lib/ai/agents/title";
import { run } from "@openai/agents";
import { Context, escape } from "ovr";

export const generateTitle = (title: string | null, text: string | null) => {
	const c = Context.get();
	return c.memo(_generateTitle)(title, text);
};

const _generateTitle = async (title: string | null, text: string | null) => {
	if (title) return title;
	if (!text) return "Message";

	const result = await run(create(), text);

	return escape(result.finalOutput);
};
