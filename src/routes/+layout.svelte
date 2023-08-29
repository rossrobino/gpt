<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";
	import Breakpoint from "$lib/components/Breakpoint.svelte";

	inject({ mode: dev ? "development" : "production" });
</script>

<div
	class="prose prose-sm prose-neutral flex min-h-[100dvh] max-w-none flex-col justify-between dark:prose-invert"
>
	<Breakpoint />
	<slot />
</div>
