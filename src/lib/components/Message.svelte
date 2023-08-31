<script lang="ts">
	import type { Message } from "$lib/types";
	import { Details, Editor } from "drab";
	import { mdToHtml } from "$lib/util/mdToHtml";
	import Chevron from "$lib/svg/Chevron.svelte";
	import X from "$lib/svg/X.svelte";
	import { createEventDispatcher } from "svelte";
	import Edit from "$lib/svg/Edit.svelte";
	import View from "$lib/svg/View.svelte";
	import type { ChatCompletionMessage } from "openai/resources/chat";
	import type { Action } from "svelte/action";

	export let message: Message;

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
			}
		}
	};
</script>

<Details bind:open={message.open} class="border-b bg-card">
	<svelte:fragment slot="summary" let:open>
		<div class="flex cursor-pointer items-center justify-between gap-8 p-4">
			<select
				class="input w-fit capitalize"
				bind:value={message.value.role}
				on:click|stopPropagation
			>
				{#each roles as role}
					<option value={role}>{role}</option>
				{/each}
			</select>
			<div class="flex items-center gap-1">
				<div
					class="button button-ghost"
					class:rotate-180={open}
					title={open ? "Close" : "Open"}
				>
					<Chevron />
				</div>
				<button
					class="button button-ghost"
					title={message.edit ? "View" : "Edit"}
					on:click|preventDefault|stopPropagation={() => {
						message.edit = !message.edit;
						message.open = true;
					}}
				>
					{#if message.edit}
						<View />
					{:else}
						<Edit />
					{/if}
				</button>
				<button
					on:click|preventDefault|stopPropagation={remove}
					title="Remove"
					class="button button-ghost"
				>
					<X />
				</button>
			</div>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="content">
		<div class="p-4">
			{#if !message.edit}
				<div role="article" on:dblclick={() => (message.edit = true)}>
					{@html mdToHtml(
						message.value.content
							? message.value.content
							: "No message available.",
					)}
				</div>
			{:else if message.value.content !== null}
				<div use:lifecycle>
					<Editor
						classTextarea="w-full h-48 min-h-[2.5rem] input"
						classControls="hidden"
						placeholderTextarea="Message"
						bind:valueTextarea={message.value.content}
					/>
				</div>
			{/if}
		</div>
	</svelte:fragment>
</Details>
