import { OpenAI } from "openai";
import type { ChatCompletionMessage } from "openai/resources/chat";
import { OPENAI_API_KEY } from "$env/static/private";
import { error } from "@sveltejs/kit";

export const POST = async ({ request }) => {
	const messages = (await request.json()) as ChatCompletionMessage[];

	console.log(messages);

	const openai = new OpenAI({
		apiKey: OPENAI_API_KEY,
	});

	try {
		const stream = await openai.chat.completions.create({
			messages,
			model: "gpt-3.5-turbo",
			stream: true,
		});

		const readable = new ReadableStream({
			start: async (controller) => {
				for await (const part of stream) {
					// instead of writing out here
					const text = new TextEncoder().encode(
						part.choices[0]?.delta?.content || "",
					);
					controller.enqueue(text);
				}
			},
		});

		return new Response(readable, {
			headers: { "content-type": "text/plain" },
		});
	} catch (e) {
		if (e instanceof OpenAI.APIError && e.status) {
			console.error(e);
			throw error(e.status, e.name);
		}
		throw error(500, "something went wrong.");
	}
};
