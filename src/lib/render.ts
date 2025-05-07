import "dotenv/config";
import { z } from "zod";

if (!process.env.CF_API_KEY) throw new Error("CF_API_KEY is not set.");
if (!process.env.CF_ACCOUNT_ID) throw new Error("CF_ACCOUNT_ID is not set.");

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

	const res = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/browser-rendering/markdown`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.CF_API_KEY}`,
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
