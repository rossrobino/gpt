<script lang="ts">
	import X from "$lib/svg/X.svelte";
	import Bars from "$lib/svg/Bars.svelte";

	export let sessionInstructions: string;
	export let localInstructions: string;
</script>

<drab-dialog
	animation-keyframe-from-transform="translateX(-100%)"
	animation-keyframe-to-transform="translateX(0)"
>
	<button data-trigger class="button button-ghost" title="Settings">
		<Bars />
	</button>

	<dialog
		data-content
		class="card my-0 ml-0 h-full max-h-screen w-full rounded-none backdrop:backdrop-blur sm:max-w-96"
	>
		<div class="flex flex-col gap-4">
			<div class="flex items-center justify-between gap-12">
				<h2 class="my-0">Custom Instructions</h2>
				<button
					data-trigger
					type="button"
					title="Close"
					class="button button-ghost"
				>
					<X />
				</button>
			</div>
			<div>
				<label class="label mb-2" for="local">Local</label>
				<drab-editor>
					<textarea
						data-content
						id="local"
						class="input h-52 min-h-[2.5rem]"
						placeholder="Saved locally in your browser"
						bind:value={localInstructions}
					></textarea>
				</drab-editor>
			</div>
			<div>
				<label class="label mb-2" for="session">Session</label>
				<drab-editor>
					<textarea
						data-content
						id="session"
						class="input h-52 min-h-[2.5rem]"
						placeholder="Saved until you close the tab"
						bind:value={sessionInstructions}
					></textarea>
				</drab-editor>
			</div>
			<div>
				<a
					target="_blank"
					href="https://openai.com/blog/custom-instructions-for-chatgpt"
				>
					Learn More
				</a>
			</div>
		</div>
	</dialog>
</drab-dialog>
