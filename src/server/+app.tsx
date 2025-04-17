import * as ai from "@/lib/ai";
import instructions from "@/lib/instructions.md?raw";
import { processor } from "@/lib/md";
import { render } from "@/lib/render";
import { Home } from "@/server/home";
import { Controls } from "@/ui/controls";
import { GenerateTitle } from "@/ui/generate-title";
import { Input } from "@/ui/input";
import { Message } from "@/ui/message";
import { PastMessages } from "@/ui/past-messages";
import { time } from "build:time";
import { html } from "client:page";
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
			<Input index={0} />
			<Controls />
		</Home>,
	);
});

app.post("/c", async (c) => {
	const data = await c.req.formData();

	let id = data.get("id") ? z.string().parse(data.get("id")) : null;
	let text = z.string().parse(data.get("text"));
	let title = data.get("title") ? z.string().parse(data.get("title")) : null;
	const web = data.get("web") === "on";
	const model =
		ai.models.find((m) => m.name === data.get("model")) ?? ai.defaultModel;
	const messageIndex = String(data.get("index"));

	c.head(<GenerateTitle title={title} text={text} />);

	c.page(
		<Home>
			<PastMessages id={id} />

			{async function* () {
				const [first, ...lines] = text.trim().split("\n");

				if (first) {
					const [url, ...rest] = first.split(" ");
					const result = z.string().url().safeParse(url);

					if (result.success) {
						const r = await render(result.data);
						if (r.success) {
							lines.unshift(`\n\n${rest.join(" ")}`);
							text = r.result + lines.join("\n");
						}
					}
				}

				yield (
					<Message
						transitionName={`m-${messageIndex}`}
						message={{ role: "user", content: text }}
					/>
				);

				const response = await ai.openai.responses.create({
					input: [
						{ role: "user", content: [{ type: "input_text", text: text }] },
					],
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
						<Input index={parseInt(messageIndex) + 1} />
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
