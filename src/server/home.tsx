import type { JSX } from "ovr";

export const Home = (props: { children: JSX.Element }) => {
	return (
		<>
			<Header />
			<main class="p-4">
				<form method="post" action="/#m">
					{props.children}
				</form>
			</main>
		</>
	);
};

const Header = () => {
	return (
		<header class="sticky top-0 z-10 flex items-center justify-end p-4">
			<a
				href="/"
				class="button icon destructive"
				aria-label="clear chat"
				style="view-transition-name: clear"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="size-5"
				>
					<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
				</svg>
			</a>
		</header>
	);
};
