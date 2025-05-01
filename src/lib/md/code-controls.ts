import * as svg from "@/ui/svg";
import type MarkdownIt from "markdown-it";
import { escape } from "ovr";

export const codeControls = async (md: MarkdownIt) => {
	const defaultFence =
		md.renderer.rules.fence ?? md.renderer.renderToken.bind(md.renderer);

	md.renderer.rules.fence = (tokens, i, opts, env, self) => {
		const token = tokens[i];

		if (!token?.markup?.startsWith("`"))
			return defaultFence(tokens, i, opts, env, self);

		const code = defaultFence(tokens, i, opts, env, self);
		const lang = token.info?.trim().split(/\s+/)[0] ?? "";
		const fileName = `code.${lang ? lang : "txt"}`;
		const escaped = escape(token.content, true);
		const encoded = encodeURIComponent(token.content);

		return /* html */ `
<div class="bg-base-900 rounded-none sm:rounded-md -mx-4 sm:mx-0 my-6">
	<div class="flex justify-between items-center p-2 border-b border-base-800 gap-2">
		<div class="font-mono px-2 text-base-100 text-sm">${lang}</div>
		<div class="flex gap-2">
			${Share(escaped)}
			${Download({ fileName, encoded })}
		</div>
	</div>
	${
		lang === "html"
			? /* html */ `<iframe class="bg-base-50 w-full my-0 border-x-2 border-base-800 border-b h-72 resize-y" srcdoc="${escaped}"></iframe>`
			: ""
	}
	${code}
</div>
`.trim();
	};
};

const Download = (props: { fileName: string; encoded: string }) =>
	/* html */ `
<a 
	class="button icon"
	aria-label="Download"
	download="${props.fileName}"
	href="data:text/plain;charset=utf-8,${props.encoded}"
>
	${svg.FolderDown()}
</a>
`.trim();

const Share = (value: string) =>
	/* html */ `
<drab-share text="${value}">
	<button
		data-trigger
		type="button"
		class="icon"
		aria-label="copy code to clipboard"
	>
		<span data-content class="contents">${svg.Copy()}</span>
		<template data-swap>${svg.CopyComplete()}</template>
	</button>
</drab-share>
`.trim();
