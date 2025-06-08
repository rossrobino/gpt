export const toCodeBlock = (lang: string | undefined, code: unknown) =>
	`\n\n\`\`\`${lang ?? "txt"}\n${typeof code === "string" ? code : JSON.stringify(code)}\n\`\`\`\n\n`;
