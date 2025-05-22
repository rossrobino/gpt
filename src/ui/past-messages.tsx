import * as ai from "@/lib/ai";
import type { ChatMessage } from "@/lib/types";
import { Details } from "@/ui/details";
import { Message } from "@/ui/message";

export const PastMessages = async (props: { id: string | null }) => {
	if (!props.id) return null;

	return (
		<Details summary="Previous messages">
			{async () => {
				if (!props.id) return null;

				const [previousInput, latestResponse] = await Promise.all([
					ai.openai.responses.inputItems.list(props.id),
					ai.openai.responses.retrieve(props.id),
				]);

				const fetchedMessages: ChatMessage[] = previousInput.data
					.reverse()
					.filter((inp) => inp.type === "message") as ChatMessage[];

				for (const output of latestResponse.output) {
					if (output.type === "message") {
						fetchedMessages.push(output);
					}
				}

				return fetchedMessages.map((entry) => <Message message={entry} />);
			}}
		</Details>
	);
};
