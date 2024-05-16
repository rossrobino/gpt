import { OpenAI } from "openai";
import { OPENAI_API_KEY } from "$env/static/private";
import { error } from "@sveltejs/kit";

export const POST = async ({ request }) => {
	const messages =
		(await request.json()) as OpenAI.Chat.ChatCompletionMessage[];

	const openai = new OpenAI({
		apiKey: OPENAI_API_KEY,
	});

	try {
		const stream = await openai.chat.completions.create({
			messages,
			model: "gpt-4o",
			stream: true,
		});

		const readable = new ReadableStream({
			start: async (controller) => {
				for await (const part of stream) {
					const text = new TextEncoder().encode(
						part.choices[0]?.delta?.content || "",
					);
					controller.enqueue(text);
				}
				controller.close();
			},
		});

		return new Response(readable, {
			headers: { "content-type": "text/plain" },
		});
	} catch (e) {
		if (e instanceof OpenAI.APIError && e.status) {
			// conflict between openai types and sveltekit's
			error(e.status as 400, e.name);
		}
		console.error(e);
		error(500);
	}
};
