import type { JSX } from "ovr";

export const Details = (
	props: { children: JSX.Element } & ({ summary: string } | { label: string }),
) => (
	<details class="group mb-6 w-full">
		<summary
			aria-label={"label" in props ? props.label : undefined}
			class="hover:bg-muted/50 flex list-none items-center justify-between gap-8 rounded p-4 transition-colors"
		>
			<span>{"summary" in props && props.summary}</span>
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
		</summary>
		<div class="pt-4">{props.children}</div>
	</details>
);
