<script lang="ts">
	import { enhance, type SubmitFunction } from "$app/forms";
	import type { ActionData } from "./$types";
	import { afterUpdate } from "svelte";
	import { fly } from "svelte/transition";

	export let form: ActionData;

	let loading = false;

	const onSubmit: SubmitFunction = () => {
		// before response
		loading = true;
		// after response
		return async ({ update }) => {
			loading = false;
			// run default update
			update();
		};
	};

	afterUpdate(() => {
		// scroll to bottom after question is updated
		window.scrollTo(0, document.body.scrollHeight);
	});
</script>

<!-- heading -->
<section
	class="fixed top-0 flex w-full items-center justify-between bg-white bg-opacity-50 p-4 backdrop-blur-md"
>
	<h1>
		<a
			class="font-semibold underline decoration-indigo-600"
			href="https://platform.openai.com/docs/models/gpt-3-5"
		>
			gpt-3.5-turbo
		</a>
	</h1>
	{#if form?.dialog.length}
		<form method="POST" action="?/clear" use:enhance>
			<button class="rounded-3xl bg-rose-600 p-2 py-2 text-white">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-8 w-8"
				>
					<title>Clear</title>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</form>
	{/if}
</section>

<!-- middle -->
<section class="mt-24 flex h-full items-center justify-center">
	{#if !form?.dialog.length}
		<div>
			<p class="m-4">
				May produce inaccurate information -
				<a
					class="font-semibold underline decoration-indigo-600"
					href="https://openai.com/blog/chatgpt">learn more about GPT</a
				>.
			</p>
		</div>
	{/if}
</section>

<div>
	<!-- dialog -->
	{#if form?.dialog}
		<section class="overflow-hidden px-4">
			{#each form?.dialog as { role, content }}
				<div
					class="mb-4 flex w-full last:mb-0"
					class:justify-end={role === "user"}
				>
					<p
						in:fly={{ duration: 400, y: 300 }}
						class="w-fit max-w-[75vw] whitespace-pre-line rounded-3xl {role ===
						'user'
							? 'bg-indigo-600 text-white'
							: 'bg-gray-200'} px-4 py-3 sm:text-lg"
					>
						{content.trim()}
					</p>
				</div>
			{/each}
		</section>
	{/if}

	<!-- message form -->
	<section
		class="sticky bottom-0 bg-white bg-opacity-50 px-4 pt-4 pb-8 backdrop-blur-md sm:pb-4"
	>
		<form method="POST" action="?/chat" use:enhance={onSubmit}>
			<input type="hidden" name="dialog" value={JSON.stringify(form?.dialog)} />
			<div class="flex gap-2">
				<input
					type="text"
					placeholder="Message"
					class="w-full rounded-full border border-gray-300 px-4 py-2 focus:outline-indigo-600 active:outline-indigo-600 sm:text-lg"
					name="question"
					autocomplete="off"
					required
				/>
				<button
					class="rounded-3xl bg-indigo-600 p-2 text-white disabled:animate-pulse disabled:bg-gray-300"
					disabled={loading}
				>
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
