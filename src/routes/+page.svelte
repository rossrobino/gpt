<script lang="ts">
	import type { Messages } from "$lib/types";
	import Message from "$lib/components/Message.svelte";
	import Bars from "$lib/svg/Bars.svelte";
	import Settings from "$lib/components/Settings.svelte";
	import Arrow from "$lib/svg/Arrow.svelte";
	import Plus from "$lib/svg/Plus.svelte";
	import X from "$lib/svg/X.svelte";

	let loading = false;
	let cancel = false;
	let display = false;
	let customInstructions = "";

	export const snapshot = {
		capture: () => customInstructions,
		restore: (value) => (customInstructions = value),
	};

	let messages: Messages = [
		{
			value: {
				role: "user",
				content: "",
			},
			open: true,
			edit: true,
		},
	];

	const chat = async () => {
		messages[messages.length - 1].edit = false;
		window.scrollTo(0, document.body.scrollHeight);
		const response = await fetch("/api/chat", {
			method: "POST",
			body: JSON.stringify([
				{ role: "system", content: customInstructions },
				...messages.map((message) => message.value),
			]),
			headers: {
				"content-type": "application/json",
			},
		});
		if (response.body) {
			messages = [
				...messages,
				{ value: { role: "assistant", content: "" }, open: true, edit: false },
			];
			const reader = response.body.getReader();
			let chunk = await reader.read();
			while (!chunk.done && !cancel) {
				messages[messages.length - 1].value.content += new TextDecoder(
					"utf-8",
				).decode(chunk.value);
				chunk = await reader.read();
				window.scrollTo(0, document.body.scrollHeight);
			}
			cancel = false;
		}
	};

	const submit = async () => {
		if (loading) {
			cancel = true;
		} else {
			loading = true;
			try {
				await chat();
				addMessage();
			} catch (error) {
				console.error(error);
			}
			loading = false;
		}
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

	const addMessage = () => {
		messages = [
			...messages,
			{
				value: { role: "user", content: "" },
				open: true,
				edit: true,
			},
		];
	};

	const removeMessage = (i: number) => {
		messages.splice(i, 1);
		messages = messages;
	};

	const clear = () => {
		if (!loading) messages = [];
	};
</script>

<svelte:document on:keydown={onKeyDown} />

<Settings bind:display bind:customInstructions />

<div>
	<header
		class="sticky top-0 z-10 flex justify-between gap-4 p-4 backdrop-blur"
	>
		<button
			class="button button-ghost"
			title="Settings"
			on:click={() => (display = true)}
		>
			<Bars />
		</button>
		<button
			on:click={clear}
			class="button button-destructive gap-1"
			disabled={loading || messages.length < 1}
		>
			Clear <X />
		</button>
	</header>
	<main class="border-t">
		{#each messages as message, i (message.value)}
			<Message on:remove={() => removeMessage(i)} bind:message />
		{/each}
	</main>
</div>
<footer class="sticky bottom-0 z-10 flex justify-end gap-4 p-4 backdrop-blur">
	<button
		on:click={addMessage}
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
