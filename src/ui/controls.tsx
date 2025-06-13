import { BackButton } from "./back-button";
import { generateId } from "@/lib/generate-id";
import { Agents } from "@/ui/agents";
import { Overview } from "@/ui/overview";
import { Popover } from "@/ui/popover";
import * as svg from "@/ui/svg";
import type { Agent } from "@openai/agents";
import type { JSX } from "ovr";

export const Controls = (props: {
	store: boolean;
	undo?: boolean;
	clear?: boolean;
	agent?: Agent;
}) => {
	return (
		<div
			class="my-3 flex flex-wrap-reverse justify-between gap-3"
			style="view-transition-name: controls"
		>
			<div class="flex gap-3">
				{props.clear && <Clear />}
				{props.undo && (
					<BackButton aria-label="Undo last message" class="icon secondary">
						<svg.Undo />
					</BackButton>
				)}
			</div>
			<div class="flex gap-3">
				<Overview />
				<Agents agent={props.agent} />
				<Attachments />
				<Temporary store={props.store} />
				<Submit />
			</div>
		</div>
	);
};

const Attachments = () => {
	return (
		<Popover
			title="Attachments"
			trigger={{ children: svg.Paperclip, class: "icon secondary" }}
		>
			<div className="flex flex-col gap-6">
				<Dataset />
				<Files />
				<Directory />
				<Website />
				<Image />
			</div>
		</Popover>
	);
};

const Input = (props: {
	label: JSX.IntrinsicElements["label"];
	input: JSX.IntrinsicElements["input"];
	description?: JSX.IntrinsicElements["div"];
}) => {
	if (props.description) {
		props.description.id = `desc-${generateId()}`;
		props.input["aria-describedby"] = props.description.id;
	}

	return (
		<div>
			<label {...props.label} />
			<input {...props.input} />
			{props.description && (
				<div class="text-base-500 mt-2 text-sm" {...props.description} />
			)}
		</div>
	);
};

const Dataset = () => (
	<Input
		label={{ for: "dataset", children: "Dataset" }}
		input={{
			type: "file",
			id: "dataset",
			name: "dataset",
			accept: ".csv,.json",
		}}
		description={{ children: "Upload a dataset to run analyses on." }}
	/>
);

const Files = () => (
	<Input
		label={{ for: "files", children: "Files" }}
		input={{ type: "file", id: "files", name: "files", multiple: true }}
		description={{
			children:
				"PDFs and images are read with vision. Word documents are read as text.",
		}}
	/>
);

const Directory = () => (
	<Input
		label={{ for: "directory", children: "Directory" }}
		input={{
			type: "file",
			id: "directory",
			name: "directory",
			multiple: true,
			webkitdirectory: true,
		}}
		description={{ children: "Select an entire directory to attach." }}
	/>
);

const Image = () => {
	return (
		<Input
			label={{ for: "image", children: "Image" }}
			input={{
				type: "url",
				name: "image",
				id: "image",
				placeholder: "https://link-to-image",
			}}
			description={{ children: "Link to an image to be read with vision." }}
		/>
	);
};

const Website = () => {
	return (
		<Input
			label={{ for: "website", children: "Website" }}
			input={{
				type: "url",
				name: "website",
				id: "website",
				placeholder: "https://website-to-include",
			}}
			description={{ children: "Include the text of a webpage." }}
		/>
	);
};

const Submit = () => (
	<button class="icon" aria-label="submit" tabindex={2}>
		<svg.Arrow />
	</button>
);

const Clear = () => {
	return (
		<drab-prefetch>
			<a
				data-trigger
				href="/"
				class="button icon destructive"
				aria-label="Clear chat"
				style="view-transition-name: clear"
			>
				<svg.X />
			</a>
		</drab-prefetch>
	);
};

const Temporary = (props: { store: boolean }) => (
	<label class="button secondary icon has-checked:bg-primary has-checked:text-primary-foreground m-0 has-focus-within:ring has-focus-within:ring-offset-1">
		<svg.MessageDashed />
		<input
			type="checkbox"
			class="sr-only"
			name="temporary"
			aria-label="Do not store messages (temporary)"
			checked={!props.store}
		/>
	</label>
);
