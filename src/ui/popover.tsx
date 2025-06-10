import { generateId } from "@/lib/generate-id";
import * as svg from "@/ui/svg";
import clsx from "clsx";
import type { JSX } from "ovr";

export const Popover = (props: {
	title?: string;
	children?: JSX.Element;
	trigger: TriggerProps;
}) => {
	const { title, children, trigger } = props;
	const { children: triggerChildren, ...triggerRest } = trigger;

	const id = `popover-${generateId()}`;

	return (
		<>
			<Trigger id={id} aria-label={title} {...triggerRest}>
				{triggerChildren}
			</Trigger>

			<div
				id={id}
				popover
				class="bg-background border-base-200 dark:border-base-800 backdrop:bg-muted/60 mx-5 my-auto max-h-[90dvh] overflow-y-auto rounded-md border p-6 opacity-0 shadow-2xl transition-[display,opacity] transition-discrete duration-300 backdrop:opacity-0 backdrop:backdrop-blur-lg backdrop:transition-[display,opacity] backdrop:transition-discrete backdrop:duration-300 open:opacity-100 open:backdrop:opacity-100 motion-reduce:duration-0 sm:mx-auto sm:max-w-[60ch] starting:open:opacity-0 starting:open:backdrop:opacity-0"
			>
				<div class="flex items-center justify-between">
					<div class="cursor-default text-xl font-semibold">{title}</div>
					<Trigger id={id}>{<svg.X />}</Trigger>
				</div>
				<div class="pt-6">{children}</div>
			</div>
		</>
	);
};

type TriggerProps = JSX.IntrinsicElements["button"];

const Trigger = (props: TriggerProps) => {
	const { id, class: className, children, ...rest } = props;

	return (
		<button
			popovertarget={id}
			type="button"
			class={clsx(!className && "icon ghost", className)}
			{...rest}
		>
			{children}
		</button>
	);
};
