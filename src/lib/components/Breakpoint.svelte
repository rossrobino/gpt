<script lang="ts">
	import { dev } from "$app/environment";
	import { Breakpoint } from "drab";
</script>

{#if dev}
	<Breakpoint
		class="fixed bottom-4 left-4 z-50 rounded border px-2 py-1 font-mono tabular-nums shadow"
	/>
{/if}
