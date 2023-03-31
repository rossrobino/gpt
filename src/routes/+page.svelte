<script lang="ts">
	import { enhance, type SubmitFunction } from "$app/forms";
	import { afterUpdate, onMount } from "svelte";
	import { info } from "$lib/info";
	import type {
		ChatCompletionRequestMessage,
		ChatCompletionRequestMessageRoleEnum,
	} from "openai";
	import { mdToHtml } from "$lib/markdownUtils";

	export let form;

	let innerHeight: number;
	let messageInput: HTMLInputElement;
	let clearButton: HTMLButtonElement;
	let submitButton: HTMLButtonElement;
	let roleSelect: HTMLSelectElement;

	let content = "";
	let role: ChatCompletionRequestMessageRoleEnum = "user";
	let loading = false;
	let clearing = false;
	let dialog: ChatCompletionRequestMessage[] = [];
	$: if (form?.dialog) dialog = form?.dialog;

	const onSubmit: SubmitFunction = () => {
		// before response
		messageInput.blur();
		loading = true;
		if (role === "user") {
			dialog?.push({ role, content });
		}
		dialog = dialog;
		content = "";
		role = "user";
		// after response
		return async ({ update }) => {
			// run default update
			update();
			loading = false;
			messageInput.focus();
		};
	};

	const onClear: SubmitFunction = () => {
		// don't show ... when clearing
		clearing = true;
		loading = true;
		return async ({ update }) => {
			update();
			loading = false;
			clearing = false;
		};
	};

	/**
	 * sets the background color of a message,
	 * opacity gets lower as the message scrolls up
	 */
	const setMessageBackgroundColor = () => {
		const messages: NodeListOf<HTMLElement> =
			document.querySelectorAll(".message");
		if (messages) {
			messages.forEach((message) => {
				const messagePositions = message.getBoundingClientRect();
				const compStyles = window.getComputedStyle(message);
				const bgColor = compStyles.getPropertyValue("background-color");
				const rgb = bgColor.split("(")[1].split(")")[0].split(",").slice(0, 3);
				const a = (messagePositions.bottom / innerHeight) * 0.3 + 0.7;
				message.style.backgroundColor = `rgba(${rgb},${a})`;
			});
		}
	};

	onMount(() => {
		document.addEventListener("keyup", ({ key }) => {
			if (key === " ") {
				// focus message on space bar keyup
				messageInput.focus();
			} else if (key === "Escape" && clearButton) {
				// clear on escape
				clearButton.click();
			} else if (key === "ArrowLeft" || key === "ArrowRight") {
				roleSelect.focus();
				if (role === "user") {
					role = "system";
				} else {
					role = "user";
				}
			}
		});
		document.addEventListener("scroll", () => {
			setMessageBackgroundColor();
		});
	});

	afterUpdate(() => {
		// scroll to bottom after dialog is updated
		window.scrollTo(0, document.body.scrollHeight);
		setMessageBackgroundColor();
	});
</script>

<svelte:window bind:innerHeight />

<!-- heading -->
<section
	class="fixed top-0 flex min-h-[5rem] w-full items-center justify-between p-4 backdrop-blur-lg"
>
	<h1 class="my-0 text-base dark:text-gray-200">
		{#if !dialog.length}
			<a href="https://platform.openai.com/docs/models/gpt-3-5">
				{info.model}
			</a>
		{/if}
	</h1>
	{#if dialog.length}
		<!-- delete button -->
		<form method="POST" action="?/clear" use:enhance={onClear}>
			<button
				class="rounded-3xl bg-rose-600 text-gray-50 focus:outline-rose-600"
				bind:this={clearButton}
				disabled={loading}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-12 w-12 p-2 py-2"
				>
					<title>Clear (esc)</title>
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
						class="message w-fit max-w-[75vw] whitespace-pre-line break-words rounded-3xl px-4 py-3 text-gray-50 sm:text-lg {role ===
						'user'
							? 'bg-indigo-600'
							: 'bg-gray-700'}"
					>
						{@html mdToHtml(content)}
					</div>
				</div>
			{/each}
			{#if loading && !clearing}
				<div
					class="w-fit animate-pulse rounded-3xl bg-gray-700 px-4 py-3 text-gray-200 sm:text-lg"
				>
					. . .
				</div>
			{/if}
		</section>
	{/if}

	<!-- message form -->
	<section class="sticky bottom-0 px-4 pt-4 backdrop-blur-lg">
		<form method="POST" action="?/chat" use:enhance={onSubmit}>
			<input type="hidden" name="dialog" value={JSON.stringify(form?.dialog)} />
			<div class="flex pb-4">
				<select
					name="role"
					bind:value={role}
					bind:this={roleSelect}
					class="rounded-l-full bg-gray-700 px-4 py-2 text-center text-gray-50 sm:text-lg"
				>
					<option value="user">User</option>
					<option value="system">System</option>
				</select>
				<input
					type="text"
					placeholder={role === "system" ? "Message, URL" : "Message"}
					class="mr-2 w-full whitespace-pre-wrap rounded-r-full border-b border-r border-t border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100 sm:text-lg"
					name="content"
					autocomplete="off"
					bind:value={content}
					bind:this={messageInput}
					required
				/>
				<button
					disabled={loading}
					bind:this={submitButton}
					class:bg-gray-800={role === "system"}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-12 w-12 p-2 py-2"
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
		<div class="-mx-4 bg-gray-100 p-4 dark:bg-gray-900 sm:hidden" />
	</section>
</div>
