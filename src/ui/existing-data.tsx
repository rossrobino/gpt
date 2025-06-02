import { escape } from "ovr";

export const ExistingData = (props: {
	dataset: Record<string, string | number>[] | null;
}) => {
	if (props.dataset) {
		return (
			<input
				type="hidden"
				value={escape(JSON.stringify(props.dataset), true)}
				name="existing-data"
			></input>
		);
	}
};
