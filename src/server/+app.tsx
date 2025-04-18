import instructions from "@/content/instructions.md?raw";
import * as ai from "@/lib/ai";
import { processor } from "@/lib/md";
import { render } from "@/lib/render";
import { Home } from "@/server/home";
import { Controls } from "@/ui/controls";
import { Input } from "@/ui/input";
import { Message } from "@/ui/message";
import { PastMessages } from "@/ui/past-messages";
import { time } from "build:time";
import { html } from "client:page";
import type { ResponseInputItem } from "openai/resources/responses/responses.mjs";
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

	c.head(async () => {
		if (!title) {
			title = (
				await ai.openai.responses.create({
					model: ai.fastestModel.name,
					input: `Create a title (<5 words) for this message:\n\n${text}`,
				})
			).output_text;
		}

		return <title>{title}</title>;
	});

	c.page(
		<Home>
			<PastMessages id={id} />

			{async function* () {
				let imageUrl: string | null = null;

				const [first, ...lines] = text.trim().split("\n");

				if (first) {
					const [url, ...rest] = first.split(" ");
					const result = z.string().url().safeParse(url);
					lines.unshift(`\n\n${rest.join(" ")}`);
					const remaining = lines.join("\n");

					if (result.success) {
						if (/\.(png|jpe?g|webp|gif)$/i.test(result.data)) {
							imageUrl = result.data;
						} else {
							const r = await render(result.data);
							if (r.success) text = r.result + remaining;
						}
					}
				}

				yield (
					<Message
						transitionName={`m-${messageIndex}`}
						message={{ role: "user", content: text }}
					/>
				);

				const input: ResponseInputItem = {
					role: "user",
					content: [{ type: "input_text", text }],
				};

				if (imageUrl && input.content instanceof Array) {
					input.content.unshift({
						type: "input_image",
						image_url: imageUrl,
						detail: "auto",
					});
				}

				const response = await ai.openai.responses.create({
					input: [input],
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

						<input
							type="hidden"
							name="title"
							value={escape(title, true)}
						></input>
						<input type="hidden" name="id" value={escape(id, true)} />
					</>
				);
			}}
		</Home>,
	);
});

export default app;
