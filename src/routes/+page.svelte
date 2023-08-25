<script lang="ts">
	import type { ChatCompletionMessage } from "openai/resources/chat";
	import { Editor, Sheet } from "drab";
	import { mdToHtml } from "$lib/util/mdToHtml";
	import SystemRole from "$lib/components/SystemRole.svelte";
	import Message from "$lib/components/Message.svelte";

	let inputForm: HTMLFormElement;

	let messages: ChatCompletionMessage[] = [];

	let content = "";

	let displaySettings = false;

	const chat = async () => {
		messages = [...messages, { role: "user", content }];
		window.scrollTo(0, document.body.scrollHeight);
		content = "";
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
				window.scrollTo(0, document.body.scrollHeight);
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

<nav>
	<button on:click={() => (displaySettings = true)}>Settings</button>
	<Sheet
		bind:display={displaySettings}
		class="z-10 backdrop-blur"
		classSheet="p-4 shadow bg-white"
	>
		<SystemRole />
	</Sheet>
</nav>

<section class="prose mx-4 my-12">
	{#each messages as message}
		<Message {message} />
	{/each}
</section>

<section class="sticky bottom-0 w-full p-4">
	<form bind:this={inputForm} on:submit|preventDefault={chat} class="flex">
		<Editor classTextarea="border grow" bind:valueTextarea={content} />
		<button class="bg-gray-950 p-4 text-white">Submit</button>
	</form>
</section>
