import * as ai from "@/lib/ai";

export const GenerateTitle = async (props: {
	title: string | null;
	text: string;
}) => {
	let { title, text } = props;

	if (!title) {
		title = (
			await ai.openai.responses.create({
				model: ai.fastestModel.name,
				input: `Create a title (<5 words) for this message:\n\n${text}`,
			})
		).output_text;
	}

	return <title>{title}</title>;
};
