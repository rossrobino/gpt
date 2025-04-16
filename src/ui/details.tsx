import type { JSX } from "ovr";

export const Details = (props: { children: JSX.Element; summary: string }) => (
	<details class="group mb-6 w-full">
		<summary class="group summary flex cursor-default list-none items-center justify-between gap-8 rounded pb-2 transition-colors">
			<div class="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
				{props.summary}
			</div>
			<div class="hover:bg-muted rounded-sm p-2 transition hover:shadow active:scale-97 active:shadow-none dark:shadow-black/75">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="size-5 transition-transform group-open:rotate-180"
				>
					<path
						fill-rule="evenodd"
						d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
		</summary>
		<div class="pt-4">{props.children}</div>
	</details>
);
