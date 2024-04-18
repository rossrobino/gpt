<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";
	import Breakpoint from "$lib/components/Breakpoint.svelte";
	import { onMount } from "svelte";

	onMount(async () => {
		if (!customElements.get("drab-editor")) {
			await import("drab/editor/define");
		}

		if (!customElements.get("drab-dialog")) {
			await import("drab/dialog/define");
		}

		if (!customElements.get("drab-details")) {
			await import("drab/details/define");
		}

		if (dev && !customElements.get("drab-breakpoint")) {
			await import("drab/breakpoint/define");
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
