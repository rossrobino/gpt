<script lang="ts">
	import { Editor, Sheet } from "drab";
	import X from "$lib/svg/X.svelte";

	export let display: boolean;

	export let customInstructions: string;
</script>

<Sheet
	bind:display
	class="z-50 backdrop-blur"
	classSheet="p-4 shadow bg-white dark:bg-neutral-900"
>
	<div class="mb-4 flex items-center justify-between gap-12">
		<h2 class="my-0">Custom Instructions</h2>
		<button
			type="button"
			title="Close"
			class="btn btn-g"
			on:click={() => (display = false)}
		>
			<X />
		</button>
	</div>
	<Editor
		classTextarea="w-full h-64 appearance-none focus:outline-none bg-transparent block placeholder:text-neutral-400"
		classControls="hidden"
		placeholderTextarea="ex: You respond in Japanese."
		bind:valueTextarea={customInstructions}
	/>
</Sheet>
