import * as ai from "@/lib/ai";
import { Details } from "@/ui/details";
import { Message } from "@/ui/message";
import type {
	ResponseInputMessageItem,
	ResponseOutputMessage,
} from "openai/resources/responses/responses.mjs";

export const PastMessages = async (props: { id: string | null }) => {
	if (props.id) {
		const [previousInput, latestResponse] = await Promise.all([
			ai.openai.responses.inputItems.list(props.id),
			ai.openai.responses.retrieve(props.id),
		]);

		const fetchedMessages = previousInput.data
			.reverse()
			.filter((inp) => inp.type === "message")
			.map((inp) => {
				const message = inp as ResponseInputMessageItem | ResponseOutputMessage;

				return {
					role: message.role,
					content: (message.content[0] as { text: string }).text,
				};
			});

		if (latestResponse.output[0]?.type === "message") {
			if (latestResponse.output[0].content[0]?.type === "output_text") {
				fetchedMessages.push({
					role: "assistant",
					content: latestResponse.output[0].content[0].text,
				});
			}
		}

		return (
			<Details summary="Previous messages">
				{fetchedMessages.map((entry) => (
					<Message message={entry} />
				))}
			</Details>
		);
	}
};
