<script lang="ts">
	import { dev } from "$app/environment";
	import "../app.postcss";
	import { inject } from "@vercel/analytics";

	inject({ mode: dev ? "development" : "production" });
</script>

<main
	class="flex min-h-[100dvh] flex-col justify-between bg-gray-50 text-gray-950 dark:bg-gray-950"
>
	<slot />
</main>
