import * as ai from "@/lib/ai";
import instructions from "@/lib/instructions.md?raw";
import { processor } from "@/lib/md";
import { render } from "@/lib/render";
import { Home } from "@/server/home";
import { Controls } from "@/ui/controls";
import { Messages, Message } from "@/ui/messages";
import { time } from "build:time";
import { html } from "client:page";
import type {
	ResponseInputMessageItem,
	ResponseOutputMessage,
} from "openai/resources/responses/responses.mjs";
import { escape, Router } from "ovr";
import { z } from "zod";

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
	// best to not prerender to prevent cold start, at least etag
	if (c.etag(time) && !import.meta.env.DEV) return;

	c.head(<title>New Message</title>);
	c.page(
		<Home>
			<Message message={{ role: "user", content: "" }} />
			<Controls />
		</Home>,
	);
});

app.post("/c", async (c) => {
	const data = await c.req.formData();

	let id = data.get("id") ? z.string().parse(data.get("id")) : null;
	const web = data.get("web") === "on";
	const model =
		ai.models.find((m) => m.name === data.get("model")) ?? ai.defaultModel;
	let title = data.get("title");
	let input = z.string().describe("Message string").parse(data.get("message"));

	c.head(
		<title>
			{async () => {
				if (title) return title;

				const response = await ai.openai.responses.create({
					model: "gpt-4.1-nano",
					input: `Create a title (<5 words) for this message:\n\n${input}`,
				});

				return (title = response.output_text);
			}}
		</title>,
	);

	c.page(
		<Home>
			{async () => {
				if (id) {
					const [previousInput, latestResponse] = await Promise.all([
						ai.openai.responses.inputItems.list(id),
						ai.openai.responses.retrieve(id),
					]);

					const fetchedMessages = previousInput.data
						.reverse()
						.filter((inp) => inp.type === "message")
						.map((inp) => {
							const message = inp as
								| ResponseInputMessageItem
								| ResponseOutputMessage;

							return {
								role: message.role,
								content: (message.content[0] as { text: string }).text,
							};
						});

					if (latestResponse.output[0]?.type === "message") {
						if (latestResponse.output[0].content[0]?.type === "output_text") {
							fetchedMessages.push({
								role: "assistant",
								content: latestResponse.output[0].content[0].text,
							});
						}
					}

					return <Messages messages={fetchedMessages} />;
				}
			}}
			{async function* () {
				const [first, ...lines] = input.trim().split("\n");

				if (first) {
					const [url, ...rest] = first.split(" ");
					const result = z.string().url().safeParse(url);

					if (result.success) {
						const r = await render(result.data);
						if (r.success) {
							lines.unshift(`\n\n${rest.join(" ")}`);
							input = r.result + lines.join("\n");
						}
					}
				}

				yield <Message md message={{ role: "user", content: input }} />;

				const response = await ai.openai.responses.create({
					input,
					instructions,
					model: model.name,
					reasoning: model.reasoning ? { effort: "medium" } : undefined,
					tools: web && model.web ? [{ type: "web_search_preview" }] : [],
					stream: true,
					truncation: "auto",
					store: true,
					previous_response_id: id,
				});

				let finalContent = "";

				const htmlStream = processor.renderStream(
					new ReadableStream<string>({
						async start(c) {
							for await (const event of response) {
								if (
									event.type === "response.output_item.added" &&
									event.item.type === "reasoning"
								) {
									c.enqueue("Reasoning...\n\n");
								} else if (event.type === "response.output_text.delta") {
									if (event.delta) {
										c.enqueue(event.delta);
										finalContent += event.delta;
									}
								} else if (event.type === "response.completed") {
									id = event.response.id;
								}
							}

							c.close();
						},
					}),
				);

				yield '<div class="py-6 chat-bubble">';

				const reader = htmlStream.getReader();
				while (true) {
					const { value, done } = await reader.read();
					if (value) yield value;
					if (done) break;
				}

				yield "</div>";

				yield (
					<>
						<Message message={{ role: "user", content: "" }} />
						<Controls model={model} web={web} />

						{title && (
							<input hidden name="title" value={escape(title, true)}></input>
						)}

						{id && <input type="hidden" name="id" value={id} />}
					</>
				);
			}}
		</Home>,
	);
});

export default app;
