<script lang="ts">
	import "../app.postcss";
	import { dev } from "$app/environment";
	import { inject } from "@vercel/analytics";
	import Breakpoint from "$lib/components/Breakpoint.svelte";

	inject({ mode: dev ? "development" : "production" });
</script>

<Breakpoint />

<main>
	<slot />
</main>
