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
	out:fly={{
		duration: 1000,
		easing: quintOut,
		x: role === "user" ? innerWidth : -innerWidth,
	}}
>
	<div
		class="message w-fit max-w-[75vw] whitespace-pre-line break-words rounded-3xl px-4 py-3 text-gray-50 shadow sm:text-lg {role ===
		'user'
			? 'bg-indigo-600'
			: 'bg-gray-700'}"
	>
		{@html mdToHtml(content)
			.replace(/(li>\n)/gm, "li>")
			.replace(/(<ul>\n)/gm, "<ul>")}
	</div>
</div>
