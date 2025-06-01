export const Input = (props: { index: number }) => (
	<>
		<drab-editor class="contents">
			<textarea
				data-content
				tabindex={1}
				name="text"
				required
				placeholder="Ask anything"
				class="bg-muted border-base-200 dark:border-base-800 mt-12 h-48 border shadow-xs outline-none dark:shadow-black/75"
				style={`view-transition-name: m-${props.index}`}
			></textarea>
		</drab-editor>
		<input type="hidden" name="index" value={props.index.toString()} />
	</>
);
