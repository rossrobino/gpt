<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData } from "./$types";
	import type { ChatCompletionRequestMessage } from "openai";
	import { dialog } from "../lib/stores";
	import { afterUpdate } from "svelte";

	export let form: ActionData;

	let question = "";
	let loading = false;

	$: $dialog[$dialog.length ? $dialog.length - 1 : 0] = {
		role: "user",
		content: question
	};

	const onSubmit = () => {
		loading = true;
	};

	const onResponse = async (message: ChatCompletionRequestMessage) => {
		loading = false;
		$dialog.push(message);
		$dialog.push({ role: "user", content: "" });
		$dialog = $dialog;
	};

	const clear = () => {
		$dialog = [];
	};

	afterUpdate(() => {
		window.scrollTo(0, document.body.scrollHeight);
	});

	$: if (form?.message) onResponse(form.message);
</script>

<div
	class="fixed top-0 flex w-full items-center justify-between bg-white bg-opacity-50 p-4 backdrop-blur-md"
>
	<a
		class="underline decoration-indigo-600"
		href="https://platform.openai.com/docs/models/gpt-3-5"
	>
		gpt-3.5-turbo
	</a>
	<button class="rounded-3xl bg-red-500 px-4 py-2 text-white" on:click={clear}>
		Clear Conversation
	</button>
</div>

<div class="mt-24 flex h-full items-center justify-center">
	{#if $dialog.length < 2}
		<div>
			<p class="rounded-3xl bg-gray-100 p-4">
				May produce inaccurate information. Click
				<a
					class="underline decoration-indigo-600"
					href="https://openai.com/blog/chatgpt">here</a
				> to learn more.
			</p>
		</div>
	{/if}
</div>

<div>
	<section class="px-4 pb-4">
		{#each $dialog as { role, content }, i}
			{#if i !== $dialog.length - 1 || role !== "user" || loading}
				<div
					class="mb-4 flex w-full last:mb-0"
					class:justify-end={role === "user"}
				>
					<p
						class="w-fit max-w-[75vw] whitespace-pre-line rounded-3xl {role ===
						'user'
							? 'bg-indigo-600 text-white'
							: 'bg-gray-200'} px-4 py-3 sm:text-lg"
					>
						{content.trim()}
					</p>
				</div>
			{/if}
		{/each}
		{#if loading}
			<div
				class="w-fit animate-pulse rounded-3xl bg-gray-200 px-4 py-1 sm:text-lg"
			>
				. . .
			</div>
		{/if}
	</section>

	<section class="sticky bottom-0 bg-white bg-opacity-50 p-4 backdrop-blur-md">
		<form method="POST" use:enhance on:submit={onSubmit}>
			<input type="hidden" name="dialog" value={JSON.stringify($dialog)} />
			<div class="flex gap-2">
				<input
					type="text"
					placeholder="Message"
					class="w-full rounded-full border px-4 py-2 focus:outline-indigo-600 sm:text-lg"
					name="question"
					autocomplete="off"
					autofocus
					required
					bind:value={question}
				/>
				<button class="rounded-3xl bg-indigo-600 p-2 text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-8 w-8"
					>
						<title>Submit</title>
						<path
							fill-rule="evenodd"
							d="M12 20.25a.75.75 0 01-.75-.75V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l6.75-6.75a.75.75 0 011.06 0l6.75 6.75a.75.75 0 11-1.06 1.06l-5.47-5.47V19.5a.75.75 0 01-.75.75z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</form>
	</section>
</div>
