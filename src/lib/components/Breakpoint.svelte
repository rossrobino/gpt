<script lang="ts">
	import { dev } from "$app/environment";
</script>

{#if dev}
	<drab-breakpoint
		class="font-sm fixed bottom-3 left-3 z-50 rounded border px-3 py-2 font-mono tabular-nums shadow"
	>
		<div data-content></div>
	</drab-breakpoint>
{/if}
