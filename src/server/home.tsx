import type { JSX } from "ovr";

export const Home = (props: { children: JSX.Element }) => {
	return (
		<main class="mx-4 my-8">
			<form method="post" action="/c">
				{props.children}
			</form>
		</main>
	);
};
