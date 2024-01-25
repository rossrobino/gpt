<script lang="ts">
	import type { Message } from "$lib/types";
	import { process } from "robino/util/md";
	import Chevron from "$lib/svg/Chevron.svelte";
	import X from "$lib/svg/X.svelte";
	import { createEventDispatcher } from "svelte";
	import Edit from "$lib/svg/Edit.svelte";
	import View from "$lib/svg/View.svelte";
	import type { ChatCompletionRole } from "openai/resources/index.mjs";
	import { fade } from "svelte/transition";

	export let message: Message;

	const dispatch = createEventDispatcher();

	const remove = () => dispatch("remove");

	const roles: ChatCompletionRole[] = ["user", "system", "assistant"];
</script>

<drab-details
	animation-keyframe-from-grid-template-rows="0fr"
	animation-keyframe-to-grid-template-rows="1fr"
>
	<details
		class="group overflow-hidden border-b bg-card"
		bind:open={message.open}
	>
		<summary data-trigger class="list-none">
			<div class="flex cursor-pointer items-center justify-between">
				<div class="flex grow items-center gap-4 overflow-hidden p-4">
					<select
						class="input w-fit capitalize"
						bind:value={message.value.role}
						on:click|stopPropagation
					>
						{#each roles as role}
							<option value={role}>{role}</option>
						{/each}
					</select>
					{#if !message.open}
						<div
							class="truncate opacity-60"
							transition:fade={{ duration: 200 }}
						>
							{message.value.content}
						</div>
					{/if}
				</div>
				<div class="flex items-center gap-1 p-4">
					<div class="button button-ghost group-[[open]]:rotate-180">
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
		</summary>
		<div data-content class="grid p-4">
			<div class="overflow-hidden">
				{#if !message.edit}
					<div role="article" on:dblclick={() => (message.edit = true)}>
						{@html process(
							message.value.content
								? message.value.content
								: "No message available.",
						).html}
					</div>
				{:else if message.value.content !== null}
					<drab-editor content="textarea">
						<textarea
							class="input h-72 min-h-[2.5rem] w-full"
							placeholder="Message"
							bind:value={message.value.content}
						></textarea>
					</drab-editor>
				{/if}
			</div>
		</div>
	</details>
</drab-details>

<style>
	/* for safari */
	summary::-webkit-details-marker {
		display: none;
	}
</style>
