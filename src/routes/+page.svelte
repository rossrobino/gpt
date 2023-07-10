<script lang="ts">
	import { dev } from "$app/environment";
	import "../app.postcss";
	import { inject } from "@vercel/analytics";
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { info } from "$lib/info";
	import type {
		ChatCompletionRequestMessage,
		ChatCompletionRequestMessageRoleEnum,
	} from "openai";
	import Message from "$lib/components/Message.svelte";

	inject({ mode: dev ? "development" : "production" });

	export let form;

	let messageInput: HTMLTextAreaElement;
	let clearButton: HTMLButtonElement;
	let roleSelect: HTMLSelectElement;

	let loading = false;
	let clearing = false;

	interface ClientForm {
		content: string;
		role: ChatCompletionRequestMessageRoleEnum;
		dialog: ChatCompletionRequestMessage[];
	}

	// for interactivity and snapshot
	let clientForm: ClientForm = {
		content: "",
		role: "user",
		dialog: [],
	};

	$: if (form?.dialog) clientForm.dialog = form?.dialog;

	export const snapshot = {
		capture: () => clientForm,
		restore: (value) => (clientForm = value),
	};

	// submit button
	const onSubmit: SubmitFunction = () => {
		messageInput.blur();
		loading = true;
		if (clientForm.role === "user") {
			clientForm.dialog?.push({
				role: clientForm.role,
				content: clientForm.content,
			});
		}
		clientForm.dialog = clientForm.dialog;
		clientForm.content = "";
		clientForm.role = "user";
		return async ({ update }) => {
			update();
			loading = false;
			messageInput.focus();
		};
	};

	// clear x button
	const onClear: SubmitFunction = () => {
		clientForm.dialog = [];
	};

	const onKeyUp = ({ key }: KeyboardEvent) => {
		if (key === " ") {
			// focus message on space bar keyup
			messageInput.focus();
		} else if (key === "Escape" && clearButton) {
			// clear on escape
			clearButton.click();
		}
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
				const a = (messagePositions.bottom / innerHeight) * 0.2 + 0.8;
				message.style.backgroundColor = `rgba(${rgb},${a})`;
			});
		}
	};
</script>

<svelte:window on:keyup={onKeyUp} on:scroll={setMessageBackgroundColor} />

<main
	class="flex min-h-[100dvh] flex-col justify-between bg-gray-50 text-gray-950"
>
	<!-- heading -->
	<section
		class="fixed top-0 flex min-h-[5rem] w-full items-center justify-between p-4 backdrop-blur-lg"
	>
		<h1 class="my-0 text-base">
			{#if !clientForm.dialog?.length}
				<a
					href="https://platform.openai.com/docs/models/gpt-3-5"
					class="tracking-wide"
				>
					{info.model}
				</a>
			{/if}
		</h1>
		{#if clientForm.dialog.length}
			<!-- delete button -->
			<form method="POST" action="?/clear" use:enhance={onClear}>
				<button
					class="rounded-3xl bg-rose-600 text-gray-50 focus:outline-rose-600"
					bind:this={clearButton}
					disabled={loading}
				>
					<!-- x icon -->
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
		{#if clientForm.dialog}
			<section class="overflow-hidden px-4 pb-4">
				{#each clientForm.dialog as { role, content }}
					<Message {role} {content} />
				{/each}
				{#if loading && !clearing}
					<div
						class="w-fit animate-pulse rounded-3xl bg-gray-100 px-4 py-3 text-gray-950 sm:text-lg"
					>
						. . .
					</div>
				{/if}
			</section>
		{/if}

		<!-- message form -->
		<section class="sticky bottom-0 px-4 pt-4 backdrop-blur-lg">
			<form method="POST" action="?/chat" use:enhance={onSubmit}>
				<input
					type="hidden"
					name="dialog"
					value={JSON.stringify(clientForm.dialog)}
				/>
				<div class="flex pb-4">
					<select
						name="role"
						bind:value={clientForm.role}
						bind:this={roleSelect}
						class="rounded-l-3xl bg-gray-700 px-4 py-2 text-center text-gray-50 shadow dark:bg-gray-800 sm:text-lg"
					>
						<option value="user">User</option>
						<option value="system">System</option>
					</select>
					<textarea
						placeholder={clientForm.role === "system"
							? "Message, URL"
							: "Message"}
						class="mr-4 h-[3rem] max-h-48 min-h-[3rem] w-full whitespace-pre-wrap rounded-r-3xl px-4 py-[0.6rem] shadow sm:text-lg"
						name="content"
						bind:value={clientForm.content}
						bind:this={messageInput}
						on:input={(e) => {
							e.currentTarget.style.height = "";
							e.currentTarget.style.height =
								e.currentTarget.scrollHeight + "px";
						}}
						required
					/>
					<button
						disabled={loading}
						class:bg-gray-700={clientForm.role === "system"}
					>
						<!-- up arrow icon -->
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
			<div class="-mx-4 bg-gray-100 p-4 sm:hidden" />
		</section>
	</div>
</main>
