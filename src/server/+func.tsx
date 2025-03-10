import { openai } from "@/lib/openai";
import { Messages, Message, type MessageEntry } from "@/ui/messages";
import { Page, escape } from "@robino/html";
import { Router } from "@robino/router";
import { html } from "client:page";

const app = new Router({
	start() {
		return { page: new Page(html) };
	},
	error({ error }) {
		console.error(error);

		return new Response("Internal server error", {
			status: 500,
			headers: { "content-type": "text/html" },
		});
	},
});

app.get("/", (c) => {
	c.res = c.state.page
		.inject(
			"chat-messages",
			<Message entry={{ index: 0, message: { role: "user", content: "" } }} />,
		)
		.inject("chat-response", <div class="chat-bubble"></div>)
		.toResponse();
});

app.post("/", async (c) => {
	const { processor } = await import("@/lib/md");

	const data = await c.req.formData();
	const entries = Array.from(data.entries());

	let newMessage = "";

	const messages: MessageEntry[] = entries.map(([name, value], i) => {
		const [key] = name.split("-");

		if (key !== "content") throw new Error(`Unknown key: ${key}`);

		let content = String(value).replaceAll("\\n", "\n");

		// render the new message
		if (i === entries.length - 1) {
			newMessage = content;
			content = processor.render(content);
		}

		return {
			index: i,
			message: {
				role: i % 2 === 0 ? "user" : "assistant",
				content,
			},
		};
	});

	c.res = c.state.page
		.inject("chat-messages", <Messages messages={messages} />)
		.inject("chat-response", async function* () {
			yield '<div class="py-6 chat-bubble">';

			const stream = await openai.chat.completions.create({
				messages: [
					{ role: "user", content: "always respond in markdown formatting" },
					...messages.map((v) => v.message).slice(0, -1),
					{ role: "user", content: newMessage },
				],
				model: "o3-mini",
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
