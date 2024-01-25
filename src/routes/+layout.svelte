<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";
	import Breakpoint from "$lib/components/Breakpoint.svelte";
	import { onMount } from "svelte";

	onMount(async () => {
		const { Editor } = await import("drab/editor");
		if (!customElements.get("drab-editor")) {
			customElements.define("drab-editor", Editor);
		}

		const { Dialog } = await import("drab/dialog");
		if (!customElements.get("drab-dialog")) {
			customElements.define("drab-dialog", Dialog);
		}

		const { Details } = await import("drab/details");
		if (!customElements.get("drab-details")) {
			customElements.define("drab-details", Details);
		}

		const { Breakpoint } = await import("drab/breakpoint");
		if (!customElements.get("drab-breakpoint")) {
			customElements.define("drab-breakpoint", Breakpoint);
		}
	});

	inject({ mode: dev ? "development" : "production" });
</script>

<div
	class="prose prose-sm prose-zinc flex min-h-[100dvh] max-w-none flex-col justify-between dark:prose-invert dark:prose-pre:bg-neutral-950"
>
	<Breakpoint />
	<slot />
</div>
