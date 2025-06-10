import * as svg from "@/ui/svg";

type Result = { repo: string; urls: string[] };

const GrepResult = (props: Result) => {
	return (
		<div class="border-muted rounded border p-4">
			<h2 class="mt-0 mb-2 text-lg">{props.repo}</h2>
			<ul class="mb-0 pl-0">
				{props.urls.map((url) => {
					return (
						<li class="flex list-none items-center gap-2 pl-0 text-sm">
							<svg.FileCode />
							<a href={url}>{url.split("/").at(-1)}</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export const GrepResults = (props: { results: Result[]; pattern: string }) => {
	return (
		<>
			<p class="mt-8">
				<a href="https://grep.app">grep</a> search results for{" "}
				<a href={`https://grep.app/search?regexp=true&q=${props.pattern}`}>
					{props.pattern}
				</a>
				:
			</p>
			<div class="mb-8 grid gap-3 sm:grid-cols-2">
				{props.results.map((result) => (
					<GrepResult {...result} />
				))}
			</div>
		</>
	);
};
