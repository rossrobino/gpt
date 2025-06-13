export const jsFormat = (obj: unknown): string => {
	if (obj instanceof Array || typeof obj === "string") {
		return JSON.stringify(obj);
	} else if (typeof obj === "object" && obj != null) {
		return `{ ${Object.entries(obj)
			.map(([k, v]) => `${k}: ${jsFormat(v)}`)
			.join(", ")} }`;
	}

	return String(obj);
};

/**
 * @param lang default "txt"
 * @param code strings are passed directly, otherwise JSON.stringify
 */
export const toMdCodeBlock = (lang: string | undefined, code: unknown) =>
	`\n\n\`\`\`${lang ?? "txt"}\n${typeof code === "string" ? code : JSON.stringify(code)}\n\`\`\`\n\n`;

/**
 * Converts an array of records into a markdown table string.
 * Assumes all records have the same keys.
 *
 * @param records Array of records with the same fields.
 * @returns Markdown table string.
 */
export const toMdTable = (records: Record<string, unknown>[]) => {
	if (!records[0]) return "";

	const keys = Object.keys(records[0]);
	const header = `\n\n| ${keys.join(" | ")} |`;
	const separator = `| ${keys.map(() => "---").join(" | ")} |`;

	const rows = records.map(
		(record) =>
			`| ${keys
				.map((key) => String(record[key]).replace(/\|/g, "\\|"))
				.join(" | ")} |`,
	);

	return [header, separator, ...rows].join("\n") + "\n\n";
};

export const toKatexBlock = (str: string) => `\n\n$$${str}$$\n\n`;
