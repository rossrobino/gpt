<script lang="ts">
	import type { ChatCompletionMessage } from "openai/resources/chat";
	import { Details, Editor } from "drab";
	import { mdToHtml } from "$lib/util/mdToHtml";
	import Chevron from "$lib/svg/Chevron.svelte";
	import X from "$lib/svg/X.svelte";
	import { createEventDispatcher } from "svelte";
	import { slide } from "svelte/transition";

	export let message: ChatCompletionMessage;

	export let open = true;

	const dispatch = createEventDispatcher();

	const remove = () => {
		dispatch("remove");
	};
</script>

<div
	transition:slide={{ duration: 200 }}
	class:bg-gray-100={message.role === "assistant"}
>
	<Details {open} class="border-b">
		<svelte:fragment slot="summary" let:open>
			<div
				class="flex cursor-pointer items-center justify-between gap-8 p-4 underline hover:decoration-dotted"
			>
				<div class="btn btn-s hover:bg-white">{message.role}</div>
				<div class="flex items-center">
					<div class="btn btn-s transition" class:rotate-180={open}>
						<Chevron />
					</div>
					<button on:click={remove} class="btn btn-s"><X /></button>
				</div>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<div class="px-4 pb-4">
				{#if message.role === "user" && message.content !== null}
					<Editor
						classTextarea="input w-full h-36"
						bind:valueTextarea={message.content}
					/>
				{:else}
					{@html mdToHtml(message.content ? message.content : "")}
				{/if}
			</div>
		</svelte:fragment>
	</Details>
</div>
