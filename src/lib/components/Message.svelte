<script lang="ts">
	import type { Message } from "$lib/types";
	import { Details, Editor } from "drab";
	import { process } from "robino/util/md";
	import Chevron from "$lib/svg/Chevron.svelte";
	import X from "$lib/svg/X.svelte";
	import { createEventDispatcher } from "svelte";
	import Edit from "$lib/svg/Edit.svelte";
	import View from "$lib/svg/View.svelte";
	import type { ChatCompletionRole } from "openai/resources/chat";
	import { fade } from "svelte/transition";

	export let message: Message;

	const dispatch = createEventDispatcher();

	const remove = () => dispatch("remove");

	const roles: ChatCompletionRole[] = [
		"user",
		"system",
		"assistant",
	];
</script>

<Details bind:open={message.open} class="border-b bg-card">
	<svelte:fragment slot="summary" let:open>
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
					<div class="truncate opacity-60" transition:fade={{ duration: 200 }}>
						{message.value.content}
					</div>
				{/if}
			</div>
			<div class="flex items-center gap-1 p-4">
				<button
					class="button button-ghost"
					class:rotate-180={open}
					title={open ? "Close" : "Open"}
				>
					<Chevron />
				</button>
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
					{@html process(
						message.value.content
							? message.value.content
							: "No message available.",
					).html}
				</div>
			{:else if message.value.content !== null}
				<Editor
					classTextarea="input w-full h-72 min-h-[2.5rem]"
					classControls="hidden"
					placeholderTextarea="Message"
					bind:valueTextarea={message.value.content}
				/>
			{/if}
		</div>
	</svelte:fragment>
</Details>
