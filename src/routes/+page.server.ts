import type {
	ChatCompletionRequestMessage,
	ChatCompletionRequestMessageRoleEnum,
} from "openai";
import { createChatCompletion } from "$lib/openai.server";
import { z } from "zod";
import { JSDOM } from "jsdom";
import { htmlToMd } from "$lib/markdownUtils";

const maxContentLength = 15_000;
const summarizeLength = 1_000;

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

			let content = String(data.get("content"));
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
							// select elements to remove
							const removeElements = body.querySelectorAll("script, img");

							// remove elements
							removeElements.forEach((el) => {
								el.parentNode?.removeChild(el);
							});

							content = await htmlToMd(body.outerHTML);
						}
					}
				}
			}

			// push the message onto the dialog
			dialog.push({ role, content });

			// count characters
			let contentLength = 0;
			dialog.forEach(({ content }) => {
				contentLength += content.length;
			});

			for (const [i, m] of dialog.entries()) {
				const contentIsToLong = contentLength > maxContentLength;
				const messageIsToLong = m.content.length > summarizeLength;
				const lastItemInList = i === dialog.length - 1;

				if (contentIsToLong && messageIsToLong) {
					try {
						// try to summarize first
						const message = await createChatCompletion([
							{
								role: "user",
								content: `summarize this text to under ${summarizeLength} characters: ${m.content}`,
							},
						]);

						// adjust content length to summarized content
						contentLength -= m.content.length;
						contentLength += message.content.length;

						// set content to the summarized content
						m.content = message.content;
					} catch {
						// if error remove item instead
						dialog.splice(i, 1);
					}
				} else if (contentIsToLong && lastItemInList) {
					// remove the first message from the dialog
					contentLength -= dialog[0].content.length;
					dialog.shift();
				}
			}

			if (role === "user") {
				// send entire dialog to openai each time, not just last message
				const message = await createChatCompletion(dialog);

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
