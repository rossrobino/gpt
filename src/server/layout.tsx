import * as chat from "@/server/chat";
import type { JSX } from "ovr";

export const Layout = (props: { children?: JSX.Element }) => {
	return (
		<main class="mx-4 my-8">
			<chat.action.Form enctype="multipart/form-data">
				{props.children}
			</chat.action.Form>
		</main>
	);
};
