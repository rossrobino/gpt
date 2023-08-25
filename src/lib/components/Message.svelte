<script lang="ts">
	import type { Message } from "$lib/types";
	import { Details, Editor } from "drab";
	import { mdToHtml } from "$lib/util/mdToHtml";
	import Chevron from "$lib/svg/Chevron.svelte";
	import X from "$lib/svg/X.svelte";
	import { createEventDispatcher } from "svelte";
	import { fade, slide } from "svelte/transition";
	import Edit from "$lib/svg/Edit.svelte";
	import View from "$lib/svg/View.svelte";
	import type { ChatCompletionMessage } from "openai/resources/chat";
	import type { Action } from "svelte/action";

	export let message: Message;

	const duration = 200;

	const dispatch = createEventDispatcher();

	const remove = () => {
		dispatch("remove");
	};

	const roles: ChatCompletionMessage["role"][] = [
		"user",
		"system",
		"assistant",
	];

	const lifecycle: Action = (node: Node) => {
		if (node instanceof HTMLElement) {
			const textarea = node.querySelector("textarea");
			if (textarea) {
				textarea.focus();
				textarea.scrollIntoView();
			}
		}
	};
</script>

<div transition:slide={{ duration: 200 }}>
	<Details bind:open={message.open}>
		<svelte:fragment slot="summary" let:open>
			<div
				class="flex cursor-pointer items-center justify-between gap-8 p-2 shadow transition"
				class:text-gray-50={message.value.role === "user" ||
					message.value.role === "system"}
				class:bg-teal-900={message.value.role === "user"}
				class:bg-gray-950={message.value.role === "system"}
				class:text-gray-900={message.value.role === "assistant"}
				class:bg-gray-300={message.value.role === "assistant"}
			>
				<select
					class="input capitalize"
					bind:value={message.value.role}
					on:click|stopPropagation
				>
					{#each roles as role}
						<option value={role}>{role}</option>
					{/each}
				</select>
				<div class="flex items-center">
					<div
						class="btn btn-s transition"
						class:rotate-180={open}
						title={open ? "Close" : "Open"}
					>
						<Chevron />
					</div>
					<button
						class="btn btn-s"
						title={message.edit ? "View" : "Edit"}
						on:click|preventDefault|stopPropagation={() =>
							(message.edit = !message.edit)}
					>
						{#if message.edit}
							<View />
						{:else}
							<Edit />
						{/if}
					</button>
					<button
						on:click|stopPropagation={remove}
						title="Remove"
						class="btn btn-s"
					>
						<X />
					</button>
				</div>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="content">
			{#if !message.edit}
				<div
					class="px-5"
					role="article"
					on:dblclick={() => (message.edit = true)}
					in:fade={{ duration }}
				>
					{@html mdToHtml(
						message.value.content
							? message.value.content
							: "No message available.",
					)}
				</div>
			{:else if message.value.content !== null}
				<div use:lifecycle in:fade={{ duration }}>
					<Editor
						classTextarea="w-full h-64 p-5 appearance-none focus:outline-none block"
						classControls="hidden"
						placeholderTextarea="Message"
						bind:valueTextarea={message.value.content}
					/>
				</div>
			{/if}
		</svelte:fragment>
	</Details>
</div>
