import { Controls } from "@/ui/controls";

export const Input = ({
	index = 0,
	store = true,
	undo,
	clear,
}: {
	index?: number;
	store?: boolean;
	undo?: boolean;
	clear?: boolean;
}) => (
	<>
		<drab-editor class="contents">
			<textarea
				data-content
				tabindex={1}
				name="text"
				placeholder="Ask anything"
				class="bg-muted border-base-200 dark:border-base-800 mt-12 h-48 border font-light shadow-xs outline-none dark:shadow-black/75"
				style={`view-transition-name: m-${index}`}
			></textarea>
		</drab-editor>
		<input type="hidden" name="index" value={index.toString()} />

		<Controls store={store} undo={undo} clear={clear} />
	</>
);
