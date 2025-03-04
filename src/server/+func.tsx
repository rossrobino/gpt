import { processor } from "@/lib/md";
import systemPrompt from "@/lib/system-prompt.md?raw";
import { Messages, Message, type MessageEntry } from "@/ui/messages";
import { Page, escape } from "@robino/html";
import { Router } from "@robino/router";
import { html } from "client:page";
import { OpenAI } from "openai";

const app = new Router({
	start() {
		return { page: new Page(html) };
	},
});

app.get("/", async (c) => {
	return c.state.page
		.inject(
			"chat-messages",
			<Message entry={{ index: 0, message: { role: "user", content: "" } }} />,
		)
		.toResponse();
});

const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });

app.post("/", async (c) => {
	const data = await c.req.formData();
	const entries = [...data.entries()];

	const messages: MessageEntry[] = entries.map(([name, value], i) => {
		const [key] = name.split("-");

		if (key !== "content") throw new Error(`Unknown key: ${key}`);

		let content = String(value).replaceAll("\\n", "\n");

		// render the new message
		if (i === entries.length - 1) content = processor.render(content);

		return {
			index: i,
			message: {
				role: i % 2 === 0 ? "user" : "assistant",
				content,
			},
		};
	});

	return c.state.page
		.inject("chat-messages", <Messages messages={messages} />)
		.inject("chat-response", async function* () {
			const stream = await openai.chat.completions.create({
				messages: [
					{ role: "system", content: systemPrompt },
					...messages.map((v) => v.message),
				],
				model: "gpt-4o-mini",
				stream: true,
			});

			const htmlStream = processor.renderStream(
				new ReadableStream<string>({
					async start(c) {
						for await (const chunk of stream) {
							const content = chunk.choices[0]?.delta.content;
							if (content) c.enqueue(content);
						}

						c.close();
					},
				}),
			);

			yield '<div class="py-8 chat-bubble">';

			let finalContent = "";
			const reader = htmlStream.getReader();

			while (true) {
				const { value, done } = await reader.read();
				if (value) {
					// stream
					yield value;
					finalContent += value;
				}
				if (done) break;
			}

			yield (
				<>
					{"</div>"}

					{/* append the final value to send back */}
					<input
						hidden
						name={`content-${messages.length}`}
						value={escape(finalContent, true)}
					></input>

					<Message
						entry={{
							index: messages.length + 1,
							message: { role: "user", content: "" },
						}}
					/>
				</>
			);
		})
		.toResponse();
});

export const handler = app.fetch;
