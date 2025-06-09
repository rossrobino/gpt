import { toCodeBlock } from "@/lib/md/util";
import type { ToolCallItem } from "@openai/agents-core/types";

const jsFormat = (obj: unknown): string => {
	if (obj instanceof Array || typeof obj === "string") {
		return JSON.stringify(obj);
	} else if (typeof obj === "object" && obj != null) {
		return `{ ${Object.entries(obj)
			.map(([k, v]) => `${k}: ${jsFormat(v)}`)
			.join(", ")} }`;
	}

	return String(obj);
};

export const ToolCall = ({ item }: { item: ToolCallItem }) => {
	if (item.type === "function_call") {
		try {
			const args = JSON.parse(item.arguments);
			return toCodeBlock("fn", `${item.name}(${jsFormat(args)})`);
		} catch (error) {
			// TODO
		}
	}
};
