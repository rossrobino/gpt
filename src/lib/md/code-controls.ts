import type MarkdownIt from "markdown-it";

export const codeControls = (md: MarkdownIt): void => {
	const defaultFence =
		md.renderer.rules.fence ?? md.renderer.renderToken.bind(md.renderer);

	md.renderer.rules.fence = (tokens, i, opts, env, self) => {
		const token = tokens[i];

		if (!token || !token.markup?.startsWith("`"))
			return defaultFence(tokens, i, opts, env, self);

		const code = defaultFence(tokens, i, opts, env, self);
		const lang = token.info?.trim().split(/\s+/)[0] ?? "";
		const fileName = `new-project.${lang ? lang : "txt"}`;
		const encoded = encodeURIComponent(token.content ?? "");

		return /* html */ `
<div class="bg-base-900 rounded-none sm:rounded-md -mx-4 sm:mx-0 my-6">
	<div class="flex justify-between items-center p-2 border-b border-base-800">
		<div class="font-mono px-2 text-base-100 text-sm">${lang}</div>
		<a class="button icon"
		aria-label="Download"
		download="${fileName}"
		href="data:text/plain;charset=utf-8,${encoded}">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
				<path fill-rule="evenodd" d="M2 4.75C2 3.784 2.784 3 3.75 3h4.836c.464 0 .909.184 1.237.513l1.414 1.414a.25.25 0 0 0 .177.073h4.836c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 16.25 17H3.75A1.75 1.75 0 0 1 2 15.25V4.75Zm8.75 4a.75.75 0 0 0-1.5 0v2.546l-.943-1.048a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.114 0l2.25-2.5a.75.75 0 1 0-1.114-1.004l-.943 1.048V8.75Z" clip-rule="evenodd" />
			</svg>
		</a>
	</div>
	${code}
</div>
`.trim();
	};
};
