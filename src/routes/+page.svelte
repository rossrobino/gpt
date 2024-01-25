<script lang="ts">
	import type { ChatCompletionRole } from "openai/resources/chat/completions.js";
	import type { Messages } from "$lib/types";
	import Message from "$lib/components/Message.svelte";
	import Settings from "$lib/components/Settings.svelte";
	import Arrow from "$lib/svg/Arrow.svelte";
	import Plus from "$lib/svg/Plus.svelte";
	import X from "$lib/svg/X.svelte";

	import { localInstructions } from "$lib/stores.js";
	import { browser } from "$app/environment";

	const chat = async () => {
		messages.forEach((m) => {
			m.edit = false;
			m.open = false;
		});
		messages = messages;
		scrollToBottom();
		const response = await fetch("/api/chat", {
			method: "POST",
			body: JSON.stringify([
				// custom instructions is always the first system message
				{ role: "system", content: instructions },
				...messages.map((message) => message.value),
			]),
			headers: {
				"content-type": "application/json",
			},
		});
		if (response.body) {
			cancel = false;
			// create new message to stream response into
			addMessage({ role: "assistant", edit: false });
			const reader = response.body.getReader();
			let chunk = await reader.read();
			let yPos = window.scrollY;
			while (!chunk.done && !cancel) {
				messages[messages.length - 1].value.content += new TextDecoder(
					"utf-8",
				).decode(chunk.value);
				chunk = await reader.read();
				// if the user scrolls up, stop scrolling down
				if (window.scrollY >= yPos) {
					scrollToBottom();
					yPos = window.scrollY;
				}
			}
		}
	};

	const submit = async () => {
		if (loading) {
			// if it is already loading, cancel
			cancel = true;
		} else {
			loading = true;
			try {
				await chat();
			} catch (error) {
				console.error(error);
			}
			loading = false;
		}
	};

	const scrollToBottom = () => {
		if (browser) window.scrollTo(0, document.body.scrollHeight);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (e.ctrlKey || e.metaKey) {
			if (e.key === "Enter") {
				e.preventDefault();
				submit();
			} else if (e.key === "Escape") {
				e.preventDefault();
				clear();
			}
		}
	};

	/**
	 * adds a new message to the end of the `messages` array
	 * @param options
	 */
	const addMessage = (
		options: { role: ChatCompletionRole; edit: boolean } = {
			role: "user",
			edit: true,
		},
	) => {
		messages = [
			...messages,
			{
				value: { role: options.role, content: "" },
				open: true,
				edit: options.edit,
			},
		];
		scrollToBottom();
	};

	/**
	 * removes the message at the specified index
	 * @param i
	 */
	const removeMessage = (i: number) => {
		messages.splice(i, 1);
		messages = messages;
	};

	const clear = () => {
		cancel = true;
		messages = [];
		addMessage();
	};

	export const snapshot = {
		capture: () => sessionInstructions,
		restore: (value) => (sessionInstructions = value),
	};

	let sessionInstructions = "";

	$: instructions = `${sessionInstructions}\n\n${$localInstructions}`;

	let loading = false;

	/** set to `false` upon response, if `true`, stops the stream loop on the client */
	let cancel = false;

	let messages: Messages = [];

	addMessage();
</script>

<svelte:document on:keydown={onKeyDown} />

<div>
	<header
		class="sticky top-0 z-10 flex justify-between gap-4 p-4 backdrop-blur"
	>
		<Settings
			bind:sessionInstructions
			bind:localInstructions={$localInstructions}
		/>

		<button on:click={clear} class="button button-destructive gap-1">
			Clear <X />
		</button>
	</header>
	<main class="mb-28 border-t">
		{#each messages as message, i (message.value)}
			<Message on:remove={() => removeMessage(i)} bind:message />
		{/each}
	</main>
</div>
<footer class="sticky bottom-0 z-10 flex justify-end gap-4 p-4 backdrop-blur">
	<button
		on:click={() => addMessage()}
		class="button button-secondary gap-1"
		disabled={loading}
	>
		New <Plus />
	</button>
	<button
		on:click={submit}
		class="button button-primary gap-1"
		disabled={messages.length < 1}
	>
		{#if loading}
			Stop <X class="animate-spin" />
		{:else}
			Send <Arrow />
		{/if}
	</button>
</footer>
