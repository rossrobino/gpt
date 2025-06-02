export const toCodeBlock = (lang: string | undefined, code: string) =>
	`\n\n\`\`\`${lang ?? "txt"}\n${code}\n\`\`\`\n\n`;
