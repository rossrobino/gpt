import {
	Configuration,
	OpenAIApi,
	type ChatCompletionRequestMessage,
} from "openai";
import { OPENAI_API_KEY } from "$env/static/private";

export const actions = {
	chat: async ({ request }) => {
		try {
			const data = await request.formData();

			// hidden input element that stores dialog
			const formDialog = data.get("dialog");

			let dialog: ChatCompletionRequestMessage[];

			// handle both cases with js = "undefined", without = ""
			if (formDialog !== "undefined" && formDialog !== "") {
				dialog = JSON.parse(formDialog as string);
			} else {
				// start of dialog will be empty
				dialog = [];
			}

			const question = data.get("question") as string;
			
			// push the question onto the dialog
			dialog.push({ role: "user", content: question });

			const configuration = new Configuration({
				apiKey: OPENAI_API_KEY,
			});

			const openai = new OpenAIApi(configuration);

			// send entire dialog to openai each time, not just last question
			const response = await openai.createChatCompletion({
				model: "gpt-3.5-turbo",
				messages: dialog,
				temperature: 0.8,
			});

			const message = response.data.choices[0]
				.message as ChatCompletionRequestMessage;
			
			// push the response to dialog list
			dialog.push(message);

			// return entire conversation
			return { dialog };
		} catch (error) {
			console.error(error);
		}
	},

	clear: async () => {
		return { dialog: [] };
	},
};
