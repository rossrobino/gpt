import { html } from "@/content/info.md";
import { defaultModel, models, type Model } from "@/lib/ai";
import { Popover } from "@/ui/popover";
import * as svg from "@/ui/svg";

export const Controls = (props: { web?: boolean; model?: Model }) => {
	return (
		<div
			class="my-4 flex justify-between gap-4"
			style="view-transition-name: controls"
		>
			<div class="flex gap-4">
				<SelectModel model={props.model} />
				<Info />
			</div>
			<div class="flex gap-4">
				<Submit />
				<Search web={props.web} />
				<Refresh />
			</div>
		</div>
	);
};

const Info = () => <Popover title="Feature Overview">{html}</Popover>;

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
			class="border-base-200 dark:border-base-800 w-36 px-2 py-1 shadow-xs dark:shadow-black/75"
		>
			{models.map(({ name }) => (
				<option value={name} selected={model.name === name}>
					{name}
				</option>
			))}
		</select>
	);
};

const Refresh = () => {
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
