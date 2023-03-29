import type {
	ChatCompletionRequestMessage,
	ChatCompletionRequestMessageRoleEnum,
} from "openai";
import { openai } from "$lib/openai.server";
import { info } from "$lib/info";
import { z } from "zod";
import { JSDOM } from "jsdom";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";

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

			let content = String(data.get("question"));
			const role = String(
				data.get("role"),
			) as ChatCompletionRequestMessageRoleEnum;

			if (role === "system") {
				// check if url
				const UrlSchema = z.string().url();
				const safeParse = UrlSchema.safeParse(content);

				// if url
				if (safeParse.success) {
					// fetch content
					const urlRes = await fetch(content);
					const html = await urlRes.text();

					const { document } = new JSDOM(html).window;

					// select body element
					const body = document.querySelector("body");

					if (body?.textContent) {
						if (content.endsWith(".md")) {
							// set to the content
							content = body.textContent;
						} else {
							// select script elements
							const scriptElements = body.querySelectorAll("script");

							// remove script tags
							scriptElements.forEach((script) => {
								script.parentNode?.removeChild(script);
							});

							// html to .md
							const md = await unified()
								.use(rehypeParse)
								.use(rehypeRemark)
								.use(remarkStringify)
								.process(body.outerHTML);

							// set content equal to md file
							content = String(md);
						}
					}
				}
			}

			// push the message onto the dialog
			dialog.push({ role, content });

			// count characters
			let characterLength = 0;
			dialog.forEach(({ content }) => {
				characterLength += content.length;
			});

			// if approaching token limit
			while (characterLength > 15000) {
				if (dialog[0].content.length > 100) {
					characterLength -= 100;
					dialog[0].content = dialog[0].content.slice(0, -100);
				} else {
					characterLength -= dialog[0].content.length;
					dialog.shift();
				}
			}

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
