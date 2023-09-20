<script lang="ts">
	import { Editor, Sheet } from "drab";
	import X from "$lib/svg/X.svelte";

	export let display: boolean;
	export let sessionInstructions: string;
	export let localInstructions: string;
</script>

<Sheet
	bind:display
	class="z-50 backdrop-blur"
	classSheet="p-4 shadow bg-card w-full flex flex-col gap-4 overflow-y-auto"
>
	<div class="flex items-center justify-between gap-12">
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
	<div>
		<label class="label mb-2" for="local">Local</label>
		<Editor
			idTextarea="local"
			classTextarea="input h-52 min-h-[2.5rem]"
			classControls="hidden"
			placeholderTextarea="Saved locally in your browser"
			bind:valueTextarea={localInstructions}
		/>
	</div>
	<div>
		<label class="label mb-2" for="session">Session</label>
		<Editor
			idTextarea="session"
			classTextarea="input h-52 min-h-[2.5rem]"
			classControls="hidden"
			placeholderTextarea="Saved until you close the tab"
			bind:valueTextarea={sessionInstructions}
		/>
	</div>
	<div>
		<a
			target="_blank"
			href="https://openai.com/blog/custom-instructions-for-chatgpt"
		>
			Learn More
		</a>
	</div>
</Sheet>
