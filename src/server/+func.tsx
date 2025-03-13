import { openai } from "@/lib/openai";
import { Messages, Message, type MessageEntry } from "@/ui/messages";
import { escape } from "@robino/html";
import { Router } from "@robino/router";
import { html } from "client:page";

const app = new Router({
	html,
	error(c) {
		console.error(c.error);

		c.res.set("Internal server error", {
			status: 500,
			headers: { contentType: "text/html" },
		});
	},
});

app.get("/", (c) => {
	c.res.html((p) => {
		p.inject(
			"chat-messages",
			<Message entry={{ index: 0, message: { role: "user", content: "" } }} />,
		).inject("chat-response", <div class="chat-bubble"></div>);
	});
});

app.post("/", async (c) => {
	const { processor } = await import("@/lib/md");

	const data = await c.req.formData();
	const contentEntries = Array.from(data.entries()).filter(([name]) =>
		name.startsWith("content"),
	);
	const web = data.get("web");

	let newMessage = "";

	const messages: MessageEntry[] = contentEntries.map(([, value], i) => {
		let content = String(value).replaceAll("\\n", "\n").replaceAll("\\t", "\t");

		// render the new message
		if (i === contentEntries.length - 1) {
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

	c.res.html((p) => {
		p.inject("chat-messages", <Messages messages={messages} />).inject(
			"chat-response",
			async function* () {
				yield '<div class="py-6 chat-bubble">';

				const response = await openai.responses.create({
					model: "gpt-4o",
					input: [
						// needed for o3-mini for some reason
						// {
						// 	role: "user",
						// 	content:
						// 		"Use markdown syntax for your responses. For example, surround codeblocks in three backticks with the language if you are writing code. I don't want you to put the entire message in a markdown codeblock just use the syntax to respond.",
						// },
						...messages.map((v) => v.message).slice(0, -1),
						{ role: "user", content: newMessage },
					],
					stream: true,
					tools: web === "on" ? [{ type: "web_search_preview" }] : [],
				});

				const htmlStream = processor.renderStream(
					new ReadableStream<string>({
						async start(c) {
							for await (const event of response) {
								if (event.type === "response.output_text.delta") {
									if (event.delta) c.enqueue(event.delta);
								}
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
			},
		);
	});
});

export const handler = app.fetch;
