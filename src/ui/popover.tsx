import { generateId } from "@/lib/generate-id";
import * as svg from "@/ui/svg";
import type { JSX } from "ovr";

export const Popover = (props: {
	title?: string;
	children?: JSX.Element;
	icon?: JSX.Element;
}) => {
	const { title = "", children, icon } = props;

	const id = `popover-${generateId()}`;

	return (
		<>
			<Trigger icon={icon} id={id} />

			<div
				id={id}
				popover
				class="bg-background border-base-200 dark:border-base-800 backdrop:bg-muted/60 m-auto mx-5 my-auto max-h-screen overflow-y-auto rounded-md border p-6 opacity-0 shadow-2xl transition-[display,opacity] transition-discrete duration-300 backdrop:opacity-0 backdrop:backdrop-blur-lg backdrop:transition-[display,opacity] backdrop:transition-discrete backdrop:duration-300 open:opacity-100 open:backdrop:opacity-100 motion-reduce:duration-0 sm:mx-auto sm:max-w-[60ch] starting:open:opacity-0 starting:open:backdrop:opacity-0"
			>
				<div class="flex items-center justify-between">
					<div class="text-xl font-bold">{title}</div>
					<Trigger id={id} hide />
				</div>
				<div class="*:mt-0">{children}</div>
			</div>
		</>
	);
};

const Trigger = (props: { hide?: boolean; icon?: JSX.Element; id: string }) => {
	const { hide, icon = <svg.Info />, id } = props;

	return (
		<button
			popovertarget={id}
			type="button"
			class="icon ghost"
			aria-label={`${props.hide ? "hide" : "show"} information`}
		>
			{hide ? <svg.X /> : icon}
		</button>
	);
};
