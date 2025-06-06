import { agent } from "@/lib/ai/agents/title";
import { run } from "@openai/agents";
import { Context, escape } from "ovr";

export const generateTitle = (title: string | null, text: string | null) => {
	const c = Context.get();
	return c.memo(gen)(title, text);
};

const gen = async (title: string | null, text: string | null) => {
	if (title) return title;
	if (!text) return "Message";

	const result = await run(agent, text);

	return escape(result.finalOutput);
};
