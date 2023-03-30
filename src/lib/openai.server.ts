import {
	Configuration,
	OpenAIApi,
	type ChatCompletionRequestMessage,
} from "openai";
import { OPENAI_API_KEY } from "$env/static/private";
import { info } from "$lib/info";

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const context: ChatCompletionRequestMessage[] = [
	{
		role: "system",
		content: "You format all responses in markdown",
	},
];

export const createChatCompletion = async (
	messages: ChatCompletionRequestMessage[],
) => {
	const response = await openai.createChatCompletion({
		model: info.model,
		messages: [...context, ...messages],
		temperature: 0.8,
	});
	const message = response.data.choices[0]
		.message as ChatCompletionRequestMessage;
	return message;
};
