import * as ai from "@/lib/ai";
import { Home } from "@/server/home";
import { Messages, Message, type MessageEntry } from "@/ui/messages";
import { html } from "client:page";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";
import { escape, Router, Suspense } from "ovr";

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
		<Home model={ai.defaultModel}>
			<Message entry={{ index: 0, message: { role: "user", content: "" } }} />
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

	let model = String(data.get("model"));
	if (!ai.models.includes(model)) model = "gpt-4o"; // default

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

	c.page(
		<Home web={web} model={model}>
			<Messages messages={messages} />

			<Suspense
				fallback={
					<p class="my-5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							class="size-5 animate-pulse"
						>
							<path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.184.551a1 1 0 0 1-.632.633l-.551.183a1 1 0 0 0 0 1.898l.551.183a1 1 0 0 1 .633.633l.183.551a1 1 0 0 0 1.898 0l.184-.551a1 1 0 0 1 .632-.633l.551-.183a1 1 0 0 0 0-1.898l-.551-.184a1 1 0 0 1-.633-.632l-.183-.551Z" />
						</svg>
					</p>
				}
			>
				{async function* () {
					const oModel = model.startsWith("o");

					const input: ResponseInput = [
						...messages.map((v) => v.message).slice(0, -1),
						{ role: "user", content: newMessage },
					];

					if (oModel) {
						// needed for o3-mini for some reason
						input.unshift({
							role: "user",
							content:
								"Use markdown syntax for your responses. For example, surround codeblocks in three backticks with the language if you are writing code. I don't want you to put the entire message in a markdown codeblock just use the syntax to respond.",
						});
					}

					const response = await ai.openai.responses.create({
						model,
						reasoning: oModel ? { effort: "high" } : undefined,
						input,
						stream: true,
						tools: web && !oModel ? [{ type: "web_search_preview" }] : [],
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
						<input
							hidden
							name={`content-${messages.length}`}
							value={escape(finalContent, true)}
						></input>
					);

					yield (
						<Message
							entry={{
								index: messages.length + 1,
								message: { role: "user", content: "" },
							}}
						/>
					);
				}}
			</Suspense>
		</Home>,
	);
});

export default app;
