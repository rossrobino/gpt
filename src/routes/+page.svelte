<script lang="ts">
	import { enhance, type SubmitFunction } from "$app/forms";
	import { afterUpdate } from "svelte";
	import { info } from "$lib/info";
	import { micromark } from "micromark";
	import type {
		ChatCompletionRequestMessage,
		ChatCompletionRequestMessageRoleEnum,
	} from "openai";

	export let form;

	let content = "";
	let role: ChatCompletionRequestMessageRoleEnum = "user";
	let loading = false;
	let dialog: ChatCompletionRequestMessage[];
	$: dialog = form?.dialog as ChatCompletionRequestMessage[];

	const onSubmit: SubmitFunction = () => {
		// before response
		loading = true;
		dialog?.push({ role, content });
		dialog = dialog;
		content = "";
		role = "user";
		// after response
		return async ({ update }) => {
			// run default update
			update();
			loading = false;
		};
	};

	const onClear: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			update();
			loading = false;
		};
	};

	afterUpdate(() => {
		// scroll to bottom after question is updated
		window.scrollTo(0, document.body.scrollHeight);
	});
</script>

<!-- heading -->
<section
	class="min-h-[5rem] fixed top-0 flex w-full items-center justify-between p-4 backdrop-blur-lg"
>
	<h1 class="my-0 text-base dark:text-gray-200">
		<a href="https://platform.openai.com/docs/models/gpt-3-5">
			{info.model}
		</a>
	</h1>
	{#if dialog?.length}
		<!-- delete button -->
		<form method="POST" action="?/clear" use:enhance>
			<button class="rounded-3xl bg-rose-600 p-2 py-2 text-gray-50">
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

<div />

<div class="mt-24">
	<!-- dialog -->
	{#if dialog}
		<section class="overflow-hidden px-4">
			{#each dialog as { role, content }}
				<div
					class="mb-4 flex w-full last:mb-0"
					class:justify-end={role === "user"}
				>
					<div
						class="message w-fit max-w-[75vw] whitespace-pre-line break-words rounded-3xl px-4 py-3 sm:text-lg {role ===
						'user'
							? 'bg-indigo-600 text-gray-50'
							: 'bg-gray-200 dark:bg-gray-800 dark:text-gray-200'}"
					>
						{@html micromark(content)}
					</div>
				</div>
			{/each}
			{#if loading}
				<div
					class="w-fit animate-pulse rounded-3xl bg-gray-200 px-4 py-3 text-xl dark:bg-gray-800 dark:text-gray-200"
				>
					. . .
				</div>
			{/if}
		</section>
	{/if}

	<!-- message form -->
	<section class="sticky bottom-0 px-4 pt-4 pb-8 backdrop-blur-lg sm:pb-4">
		<form method="POST" action="?/chat" use:enhance={onSubmit}>
			<input type="hidden" name="dialog" value={JSON.stringify(form?.dialog)} />
			<div class="flex">
				<select
					name="role"
					bind:value={role}
					class="rounded-l-full bg-gray-800 py-2 pl-3 pr-0.5 text-gray-50 focus:outline-indigo-600 active:outline-indigo-600 sm:text-lg"
				>
					<option value="user">User</option>
					<option value="system">System</option>
				</select>
				<input
					type="text"
					placeholder="Message"
					class="mr-2 w-full whitespace-pre-wrap rounded-r-full border border-gray-300 px-4 py-2 focus:outline-indigo-600 active:outline-indigo-600 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 sm:text-lg"
					name="question"
					autocomplete="off"
					bind:value={content}
					required
				/>
				<button
					class="rounded-3xl bg-indigo-600 p-2 text-gray-50 disabled:animate-pulse disabled:bg-gray-200 dark:disabled:bg-gray-800"
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
