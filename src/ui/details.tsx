import * as svg from "@/ui/svg";
import { clsx } from "clsx";
import type { JSX } from "ovr";

export const Details = (props: {
	children: JSX.Element;
	summary: string;
	hover?: boolean;
}) => (
	<details class="group mb-6 w-full">
		<summary class="group summary flex cursor-default list-none items-center justify-between gap-8 rounded pb-2 transition-colors">
			<div
				class={clsx(
					"text-muted-foreground",
					props.hover && "opacity-0 transition-opacity group-hover:opacity-100",
				)}
			>
				{props.summary}
			</div>
			<div class="group-hover:bg-muted rounded-md p-2 transition group-hover:shadow-sm group-active:scale-97 group-active:shadow-none dark:shadow-black/75">
				<div class="flex size-6 items-center justify-center transition-transform group-open:rotate-180">
					<svg.Chevron />
				</div>
			</div>
		</summary>
		<div class="pt-4">{props.children}</div>
	</details>
);
