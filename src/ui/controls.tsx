import { html } from "@/content/info.md";
import { defaultModel, models, type Model } from "@/lib/ai";
import { Popover } from "@/ui/popover";
import * as svg from "@/ui/svg";

export const Controls = (props: { web?: boolean; model?: Model }) => {
	return (
		<div
			class="my-3 flex flex-wrap-reverse justify-between gap-3"
			style="view-transition-name: controls"
		>
			<div class="flex gap-3">
				<SelectModel model={props.model} />
				<Info />
			</div>
			<div class="flex gap-3">
				<Attachments />
				<Clear />
				<Search web={props.web} />
				<Submit />
			</div>
		</div>
	);
};

const Attachments = () => {
	return (
		<Popover title="Attachments" icon={svg.Paperclip}>
			<div className="flex flex-col gap-3 pt-4">
				<Website />
				<Image />
				<Files />
				<Directory />
			</div>
		</Popover>
	);
};

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

const Info = () => <Popover title="Overview">{html}</Popover>;

const Submit = () => (
	<button class="icon" aria-label="submit" tabindex={2}>
		<svg.Arrow />
	</button>
);

const Search = (props: { web?: boolean }) => (
	<label class="button secondary icon has-checked:bg-primary has-checked:text-primary-foreground m-0 has-focus-within:ring has-focus-within:ring-offset-1">
		<svg.Web />
		<input
			type="checkbox"
			class="sr-only"
			name="web"
			aria-label="web search"
			checked={props.web}
		/>
	</label>
);

const SelectModel = (props: { model?: Model }) => {
	let { model = defaultModel } = props;
	if (!models.includes(model)) model = defaultModel;

	return (
		<select
			name="model"
			aria-label="select model"
			class="border-base-200 dark:border-base-800 w-34 px-2 py-1 shadow-xs dark:shadow-black/75"
		>
			{models.map(({ name }) => (
				<option value={name} selected={model.name === name}>
					{name}
				</option>
			))}
		</select>
	);
};

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
