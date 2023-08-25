<script lang="ts">
	import type { ChatCompletionMessage } from "openai/resources/chat";
	import { Details } from "drab";
	import { mdToHtml } from "$lib/util/mdToHtml";

	export let message: ChatCompletionMessage;
</script>

<Details open class="border-b">
	<svelte:fragment slot="summary" let:open>
		<div
			class="flex cursor-pointer items-center justify-between gap-8 p-4 underline hover:decoration-dotted"
		>
			<div>{message.role}</div>
			<div class="transition" class:rotate-180={open}>x</div>
		</div>
	</svelte:fragment>
	<svelte:fragment slot="content">
		<div class="px-4 pb-4">
			{@html mdToHtml(message.content ? message.content : "")}
		</div>
	</svelte:fragment>
</Details>
