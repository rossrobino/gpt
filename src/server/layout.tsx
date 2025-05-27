import * as home from "@/server/home";
import type { JSX } from "ovr";

export const Layout = (props: { children?: JSX.Element }) => {
	return (
		<main class="mx-4 my-8">
			<home.action.Form enctype="multipart/form-data">
				{props.children}
			</home.action.Form>
		</main>
	);
};
