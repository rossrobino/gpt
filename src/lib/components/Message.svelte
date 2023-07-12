<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from "openai";
	import { mdToHtml } from "$lib/markdownUtils";
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	export let role: ChatCompletionRequestMessageRoleEnum = "user";
	export let content = "";
	let innerWidth: number;

	onMount(() => {
		// scroll to bottom when new message appears
		window.scrollTo(0, document.body.scrollHeight);
	});
</script>

<svelte:window bind:innerWidth />

<div
	class="mb-4 flex w-full last:mb-0"
	class:justify-end={role === "user"}
	class:justify-center={role === "system"}
	out:fly={{
		duration: 1000,
		easing: quintOut,
		x: role === "user" ? innerWidth : -innerWidth,
	}}
>
	<div
		class="message w-fit max-w-[90%] whitespace-pre-line break-words rounded-3xl px-4 py-[0.6rem] text-gray-50 shadow sm:text-lg"
		class:bg-blue-600={role === "user"}
		class:bg-gray-50={role === "assistant"}
		class:text-gray-950={role === "assistant"}
		class:bg-gray-700={role === "system"}
	>
		{@html mdToHtml(content)
			.replace(/(li>\n)/gm, "li>")
			.replace(/(<ul>\n)/gm, "<ul>")}
	</div>
</div>
