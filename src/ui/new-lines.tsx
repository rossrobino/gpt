import type { JSX } from "ovr";

/**
 * This is so markdown is processed correctly when yielding into the renderer.
 */
export const NewLines = (props: { children?: JSX.Element }) => {
	return (
		<>
			{"\n\n"}
			{props.children}
			{"\n\n"}
		</>
	);
};
