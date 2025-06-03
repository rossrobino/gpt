import clsx from "clsx";
import * as ovr from "ovr";

export const Arrow = () =>
	`<span class="icon-[lucide--send-horizontal] rotate-270"></span>`;

export const X = () => `<span class="icon-[lucide--x]"></span>`;

export const Web = () => `<span class="icon-[lucide--globe]"></span>`;

export const Info = () => `<span class="icon-[lucide--info]"></span>`;

export const FolderDown = () =>
	`<span class="icon-[lucide--folder-down]"></span>`;

export const Copy = () => `<span class="icon-[lucide--clipboard-copy]"></span>`;

export const Paperclip = () => `<span class="icon-[lucide--paperclip]"></span>`;

export const Refresh = () => `<span class="icon-[lucide--rotate-cw]"></span>`;

export const Chart = (props: ovr.JSX.IntrinsicElements["span"]) => {
	const { class: className, ...rest } = props;
	return (
		<span class={clsx("icon-[lucide--chart-scatter]", className)} {...rest} />
	);
};

export const MessageDashed = (props: ovr.JSX.IntrinsicElements["span"]) => {
	const { class: className, ...rest } = props;
	return (
		<span
			class={clsx("icon-[lucide--message-circle-dashed]", className)}
			{...rest}
		/>
	);
};

export const CopyComplete = () =>
	`<span class="icon-[lucide--clipboard-check]"></span>`;

export const Undo = () => `<span class="icon-[lucide--undo]"></span>`;
