<script lang="ts">
	import type { ChatCompletionMessage } from "openai/resources/chat";
	import { Editor, Sheet } from "drab";
	import { mdToHtml } from "$lib/util/mdToHtml";

	let inputForm: HTMLFormElement;

	let messages: ChatCompletionMessage[] = [];

	let content = "";

	let displaySettings = false;

	const chat = async () => {
		messages = [...messages, { role: "user", content }];
		const response = await fetch("/api/chat", {
			method: "POST",
			body: JSON.stringify(messages),
			headers: {
				"content-type": "application/json",
			},
		});
		if (response.body) {
			messages = [...messages, { role: "assistant", content: "" }];
			const reader = response.body.getReader();
			let chunk = await reader.read();
			while (!chunk.done) {
				console.log(chunk);
				messages[messages.length - 1].content += new TextDecoder(
					"utf-8",
				).decode(chunk.value);
				chunk = await reader.read();
			}
		}
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (!e.shiftKey && e.key === "Enter") {
			chat();
		}
	};
</script>

<svelte:document on:keydown={onKeyDown} />

<header>
	<button on:click={() => (displaySettings = true)}>Settings</button>
</header>

<Sheet
	bind:display={displaySettings}
	class="backdrop-blur"
	classSheet="p-4 shadow bg-white"
>
	<h3>System Prompt</h3>
	<Editor />
</Sheet>

<section class="prose m-4">
	{#each messages as message}
		<h2>{message.role}</h2>
		<div>
			{@html mdToHtml(message.content ? message.content : "")}
		</div>
		<hr />
	{/each}
</section>

<section class="fixed bottom-0 w-full p-4">
	<form bind:this={inputForm} on:submit|preventDefault={chat} class="flex">
		<Editor classTextarea="border grow" bind:valueTextarea={content} />
		<button class="bg-gray-950 p-4 text-white">Submit</button>
	</form>
</section>
