export const Input = (props: { index: number }) => (
	<>
		<textarea
			tabindex={1}
			name="text"
			placeholder="Ask anything"
			class="bg-muted border-base-200 dark:border-base-800 mt-12 h-48 border shadow-sm transition outline-none focus:shadow-md dark:shadow-black/75"
			style={`view-transition-name: m-${props.index}`}
		></textarea>
		<input type="hidden" name="index" value={props.index.toString()} />
	</>
);
