import type { JSX } from "ovr";

export const BackButton = (props: JSX.IntrinsicElements["button"]) => (
	<button type="button" onclick="history.back()" {...props} />
);
