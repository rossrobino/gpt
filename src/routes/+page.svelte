<script lang="ts">
	import type { Messages } from "$lib/types";
	import Message from "$lib/components/Message.svelte";

	let loading = false;
	let cancel = false;

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
			body: JSON.stringify(messages.map((message) => message.value)),
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

<section class="prose prose-sm max-w-none">
	{#each messages as message, i (message.value)}
		<Message on:remove={() => removeMessage(i)} bind:message />
	{/each}
	<div class="flex justify-between gap-4 p-4">
		<div>
			<button
				on:click={clear}
				class="btn btn-d"
				class:hidden={messages.length < 1}
				disabled={loading}
			>
				Clear
			</button>
		</div>
		<div class="flex gap-4">
			<button on:click={addMessage} class="btn" disabled={loading}>New</button>
			<button on:click={submit} class="btn" class:hidden={messages.length < 1}>
				{loading ? "Stop" : "Submit"}
			</button>
		</div>
	</div>
</section>
