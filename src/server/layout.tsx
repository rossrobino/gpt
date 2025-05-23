import type { JSX } from "ovr";

export const Layout = (props: { children?: JSX.Element }) => {
	return (
		<main class="mx-4 my-8">
			<form method="post" action="/c" enctype="multipart/form-data">
				{props.children}
			</form>
		</main>
	);
};
