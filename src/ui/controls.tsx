import { BackButton } from "./back-button";
import { Agents } from "@/ui/agents";
import { Overview } from "@/ui/overview";
import { Popover } from "@/ui/popover";
import * as svg from "@/ui/svg";

export const Controls = (props: {
	store: boolean;
	undo?: boolean;
	clear?: boolean;
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
				<Agents />
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
			<div className="flex flex-col gap-3 pt-4">
				<Dataset />
				<Files />
				<Directory />
				<Website />
				<Image />
			</div>
		</Popover>
	);
};

const Dataset = () => (
	<div>
		<label for="dataset">Dataset</label>
		<input type="file" id="dataset" name="dataset" accept=".csv,.json" />
	</div>
);

const Files = () => (
	<div>
		<label for="files">Files</label>
		<input type="file" id="files" name="files" multiple />
	</div>
);

const Directory = () => (
	<div>
		<label for="directory">Directory</label>
		<input
			type="file"
			id="directory"
			name="directory"
			multiple
			webkitdirectory
		/>
	</div>
);

const Image = () => {
	return (
		<div>
			<label for="image">Image</label>
			<input
				type="url"
				name="image"
				id="image"
				placeholder="https://link-to-image"
			/>
		</div>
	);
};

const Website = () => {
	return (
		<div>
			<label for="website">Website</label>
			<input
				type="url"
				name="website"
				id="website"
				placeholder="https://website-to-include"
			/>
		</div>
	);
};

const Submit = () => (
	<button class="icon" aria-label="submit" tabindex={2}>
		<svg.Arrow />
	</button>
);

const Clear = () => {
	return (
		<drab-prefetch prerender>
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
