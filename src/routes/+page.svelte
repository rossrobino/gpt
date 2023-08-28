<script lang="ts">
	import type { Messages } from "$lib/types";
	import Message from "$lib/components/Message.svelte";
	import Bars from "$lib/svg/Bars.svelte";
	import { Editor, Sheet } from "drab";
	import X from "$lib/svg/X.svelte";
	import Plus from "$lib/svg/Plus.svelte";
	import Arrow from "$lib/svg/Arrow.svelte";

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
		if (e.ctrlKey && e.key === "Enter" && !loading) {
			e.preventDefault();
			submit();
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
		messages = [];
	};
</script>

<svelte:document on:keydown={onKeyDown} />

<Sheet
	bind:display
	class="z-50 backdrop-blur"
	classSheet="p-4 shadow bg-white dark:bg-neutral-900"
>
	<div class="mb-4 flex items-center justify-between gap-12">
		<h2 class="my-0">Custom Instructions</h2>
		<button
			type="button"
			title="Close"
			class="btn btn-s"
			on:click={() => (display = false)}
		>
			<X />
		</button>
	</div>
	<Editor
		classTextarea="w-full h-64 appearance-none focus:outline-none bg-transparent block placeholder:text-neutral-400"
		classControls="hidden"
		placeholderTextarea="ex: You respond in Japanese."
		bind:valueTextarea={customInstructions}
	/>
</Sheet>

<div>
	<header
		class="sticky top-0 z-10 flex justify-between gap-3 p-3 backdrop-blur"
	>
		<button
			class="btn btn-s"
			title="Settings"
			on:click={() => (display = true)}
		>
			<Bars />
		</button>
		<button
			on:click={clear}
			class="btn btn-d flex items-center gap-1"
			class:hidden={messages.length < 1}
			disabled={loading}
		>
			Clear <X />
		</button>
	</header>
	<main class="border-t dark:border-neutral-700">
		{#each messages as message, i (message.value)}
			<Message on:remove={() => removeMessage(i)} bind:message />
		{/each}
	</main>
</div>
<footer class="sticky bottom-0 z-10 flex justify-end gap-3 p-3 backdrop-blur">
	<button
		on:click={addMessage}
		class="btn flex items-center gap-1"
		disabled={loading}
	>
		New <Plus />
	</button>
	<button
		on:click={submit}
		class="btn flex items-center gap-1"
		class:hidden={messages.length < 1}
	>
		{#if loading}
			Stop <X />
		{:else}
			Send <Arrow />
		{/if}
	</button>
</footer>
