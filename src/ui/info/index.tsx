import { html } from "./index.md";
import * as svg from "@/ui/svg";

export const Info = () => {
	return (
		<>
			<Trigger />

			<div
				id="info"
				popover
				class="bg-background border-base-200 dark:border-base-800 backdrop:bg-muted/60 m-auto mx-5 my-auto rounded-md border p-6 opacity-0 shadow-2xl transition-[display,opacity] transition-discrete duration-300 backdrop:opacity-0 backdrop:backdrop-blur-lg backdrop:transition-[display,opacity] backdrop:transition-discrete backdrop:duration-300 open:opacity-100 open:backdrop:opacity-100 motion-reduce:duration-0 sm:mx-auto sm:max-w-[75ch] starting:open:opacity-0 starting:open:backdrop:opacity-0"
			>
				<div class="mb-4 flex items-center justify-between">
					<div class="text-lg font-bold">Features</div>
					<Trigger hide />
				</div>
				{html}
			</div>
		</>
	);
};

const Trigger = (props: { hide?: boolean }) => (
	<button
		popovertarget="info"
		type="button"
		class="icon ghost"
		aria-label={`${props.hide ? "hide" : "show"} information`}
	>
		{props.hide ? <svg.X /> : <svg.Info />}
	</button>
);
