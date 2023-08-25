<script lang="ts">
	import type { ChatCompletionMessage } from "openai/resources/chat";
	import { Sheet } from "drab";
	import SystemRole from "$lib/components/SystemRole.svelte";
	import Message from "$lib/components/Message.svelte";

	let messages: ChatCompletionMessage[] = [{ role: "user", content: "" }];

	let displaySettings = false;

	const chat = async () => {
		window.scrollTo(0, document.body.scrollHeight);
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
			e.preventDefault();
			chat();
		}
	};

	const addMessage = () => {
		messages = [...messages, { role: "user", content: "" }];
	};

	const removeMessage = (i: number) => {
		console.log("remove");
		messages.splice(i, 1);
		messages = messages;
	};
</script>

<svelte:document on:keydown={onKeyDown} />

<nav>
	<button class="btn btn-s" on:click={() => (displaySettings = true)}>
		Settings
	</button>
	<Sheet
		bind:display={displaySettings}
		class="z-10 backdrop-blur"
		classSheet="p-4 shadow bg-white"
	>
		<SystemRole />
	</Sheet>
</nav>

<section class="prose my-12 max-w-none">
	{#each messages as message, i}
		<Message on:remove={() => removeMessage(i)} {message} />
	{/each}
	<div class="flex justify-end p-4">
		<button on:click={addMessage} class="btn">New</button>
	</div>
</section>

<section class="sticky bottom-0 flex justify-end p-4">
	<form on:submit|preventDefault={chat}>
		<button class="btn">Submit</button>
	</form>
</section>
