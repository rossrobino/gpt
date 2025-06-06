import * as ai from "@/lib/ai";
import { Details } from "@/ui/details";
import { Message } from "@/ui/message";

export const PastMessages = async (props: { id?: string }) => {
	if (!props.id) return null;

	return (
		<Details summary="Previous messages">
			{async () => {
				if (!props.id) return null;

				const [previousInput, latestResponse] = await Promise.all([
					ai.openai.responses.inputItems.list(props.id),
					ai.openai.responses.retrieve(props.id),
				]);

				const fetchedInput = [
					...previousInput.data.reverse(),
					...latestResponse.output,
				];

				return fetchedInput.map((message, i) => (
					<Message input={message} index={i} />
				));
			}}
		</Details>
	);
};
