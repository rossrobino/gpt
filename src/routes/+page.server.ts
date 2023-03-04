import type { Actions } from "./$types";
import {
	Configuration,
	OpenAIApi,
	type ChatCompletionRequestMessage,
} from "openai";
import { OPENAI_API_KEY } from "$env/static/private";

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const dialog: ChatCompletionRequestMessage[] = JSON.parse(
			data.get("dialog") as string,
		);
		const configuration = new Configuration({
			apiKey: OPENAI_API_KEY,
		});
		const openai = new OpenAIApi(configuration);
		const response = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: dialog,
			temperature: 0,
			max_tokens: 500,
		});
		console.log(response.data.choices[0]);
		const message = response.data.choices[0].message;
		return { message };
	},
} satisfies Actions;
