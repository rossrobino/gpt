import type {
	ChatCompletionRequestMessage,
	ChatCompletionRequestMessageRoleEnum,
} from "openai";
import { openai } from "$lib/openai.server";
import { info } from "$lib/info";

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
				dialog = [];
			}

			const question = String(data.get("question"));
			const role = String(
				data.get("role"),
			) as ChatCompletionRequestMessageRoleEnum;

			// push the question onto the dialog
			dialog.push({ role, content: question });

			if (role === "user") {
				const context: ChatCompletionRequestMessage[] = [
					{
						role: "system",
						content: "You format all responses in markdown",
					},
				];

				// send entire dialog to openai each time, not just last question
				const response = await openai.createChatCompletion({
					model: info.model,
					messages: [...context, ...dialog],
					temperature: 0.8,
				});

				const message = response.data.choices[0]
					.message as ChatCompletionRequestMessage;

				// push the response to dialog list
				dialog.push(message);
			}

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
