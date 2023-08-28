<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";
	import Breakpoint from "$lib/components/Breakpoint.svelte";

	inject({ mode: dev ? "development" : "production" });
</script>

<main class="prose prose-sm prose-neutral max-w-none dark:prose-invert">
	<Breakpoint />
	<slot />
</main>
