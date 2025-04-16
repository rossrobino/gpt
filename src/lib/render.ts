import { z } from "zod";

const RenderSchema = z.object({ success: z.boolean(), result: z.string() });

/**
 * @param url - Page to render
 * @returns Markdown content
 */
export const render = async (
	url: string,
): Promise<
	{ success: true; result: string } | { success: false; error: string }
> => {
	"https://github.com/rossrobino/robino/blob/main/packages/md/src/processor/index.ts";
	"https://raw.githubusercontent.com/rossrobino/robino/refs/heads/main/packages/md/src/processor/index.ts";

	if (url.startsWith("https://github.com/")) {
		url = url
			.replace("github.com", "raw.githubusercontent.com")
			.replace("blob", "refs/heads");
	}

	if (url.startsWith("https://raw.githubusercontent.com/")) {
		const res = await fetch(url);

		if (!res.ok)
			return { success: false, error: "Could not find GitHub content." };

		const code = await res.text();
		const lang = url.split(".").at(-1);

		return { success: true, result: `\`\`\`${lang}\n${code}\n\`\`\`` };
	}
	const apiKey = import.meta.env.VITE_CF_API_KEY;
	const accountId = import.meta.env.VITE_CF_ACCOUNT_ID;

	if (!apiKey) {
		throw new Error("Missing CF_BROWSER_RENDERING environment variable");
	}
	if (!accountId) {
		throw new Error("Missing CF_ACCOUNT_ID environment variable");
	}

	const res = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/markdown`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({ url: url }),
		},
	);

	if (!res.ok) {
		return {
			success: false,
			error: `Cloudflare API error (${res.status}): ${await res.text()}`,
		};
	}

	const result = RenderSchema.safeParse(await res.json());

	if (result.data?.success) {
		return { success: true, result: result.data.result };
	}

	return {
		success: false,
		error: result.error?.issues[0]?.message ?? "Unknown error occurred",
	};
};
