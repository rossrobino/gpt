<script lang="ts">
	import { Editor, Sheet } from "drab";
	import X from "$lib/svg/X.svelte";

	export let display: boolean;

	export let customInstructions: string;
</script>

<Sheet
	bind:display
	class="z-50 backdrop-blur"
	classSheet="p-4 shadow bg-card w-full"
>
	<div class="mb-4 flex items-center justify-between gap-12">
		<h2 class="my-0">Custom Instructions</h2>
		<button
			type="button"
			title="Close"
			class="button button-ghost"
			on:click={() => (display = false)}
		>
			<X />
		</button>
	</div>
	<Editor
		classTextarea="input h-48"
		classControls="hidden"
		placeholderTextarea="ex: You respond in Japanese."
		bind:valueTextarea={customInstructions}
	/>
</Sheet>
