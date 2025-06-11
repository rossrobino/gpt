import { Controls } from "@/ui/controls";
import type { Agent } from "@openai/agents";

export const Input = ({
	index = 0,
	store = true,
	undo,
	clear,
	agent,
}: {
	index?: number;
	store?: boolean;
	undo?: boolean;
	clear?: boolean;
	agent?: Agent;
}) => (
	<>
		<drab-editor class="contents">
			<textarea
				data-content
				tabindex={1}
				name="text"
				placeholder="Ask anything"
				class="bg-muted border-secondary mt-12 h-42 border font-light shadow-xs outline-none"
				style={`view-transition-name: m-${index}`}
			></textarea>
		</drab-editor>

		<input type="hidden" name="index" value={index.toString()} />

		<Controls store={store} undo={undo} clear={clear} agent={agent} />
	</>
);
