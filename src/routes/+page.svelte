<script lang="ts">
	import type { ChatCompletionMessage } from "openai/resources/chat";
	import { Editor } from "drab";

	let messages: ChatCompletionMessage[] = [];

	let content = "";
	let completion: ChatCompletionMessage;

	let text = "";

	const chat = async (e: SubmitEvent) => {
		messages.push({ role: "user", content });
		const response = await fetch("/api/chat", {
			method: "POST",
			body: JSON.stringify(messages),
			headers: {
				"content-type": "application/json",
			},
		});
		if (response.body) {
			const reader = response.body.getReader();
			let chunk = await reader.read();
			while (!chunk.done) {
				const value = new TextDecoder("utf-8").decode(chunk.value);
				text += value;
				chunk = await reader.read();
			}
		}
	};
</script>

{text}

{JSON.stringify(messages)}

<form on:submit|preventDefault={chat}>
	<Editor classTextarea="input" bind:valueTextarea={content} />
	<button>Submit</button>
</form>
