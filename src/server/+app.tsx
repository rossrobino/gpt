import * as ai from "@/lib/ai";
import systemPrompt from "@/lib/system-prompt.md?raw";
import { Home } from "@/server/home";
import { Controls } from "@/ui/controls";
import { Messages, Message, type MessageEntry } from "@/ui/messages";
import { html } from "client:page";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";
import { escape, Router } from "ovr";

const app = new Router({
	start(c) {
		c.base = html;
		c.error = (c, error) => {
			console.error(error);
			c.html("Internal server error", 500);
		};
	},
});

app.get("/", (c) => {
	c.page(
		<Home>
			<Message entry={{ index: 0, message: { role: "user", content: "" } }} />
			<Controls />
		</Home>,
	);
});

app.post("/", async (c) => {
	const { processor } = await import("@/lib/md");

	const data = await c.req.formData();

	const contentEntries = Array.from(data.entries()).filter(([name]) =>
		name.startsWith("content"),
	);

	const web = data.get("web") === "on";

	const model = String(data.get("model"));

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
			message: { role: i % 2 === 0 ? "user" : "assistant", content },
		};
	});

	c.page(
		<Home>
			<Messages messages={messages} />

			{async function* () {
				const input: ResponseInput = [
					{ role: "system", content: systemPrompt },
					...messages.map((v) => v.message).slice(0, -1),
					{ role: "user", content: newMessage },
				];

				const response = await ai.openai.responses.create({
					model,
					input,
					stream: true,
					tools: web ? [{ type: "web_search_preview" }] : [],
				});

				const htmlStream = processor.renderStream(
					new ReadableStream<string>({
						async start(c) {
							for await (const event of response) {
								if (event.type === "response.output_text.delta")
									if (event.delta) c.enqueue(event.delta);
							}

							c.close();
						},
					}),
				);

				let finalContent = "";

				const reader = htmlStream.getReader();

				for (let i = 0; ; i++) {
					const { value, done } = await reader.read();
					if (i === 0) yield '<div class="py-6 chat-bubble">'; // don't send early for loader

					if (value) {
						yield value;
						finalContent += value;
					}
					if (done) break;
				}

				yield "</div>";

				yield (
					<>
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
						<Controls model={model} web={web} />
					</>
				);
			}}
		</Home>,
	);
});

export default app;
