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

		if (lang.startsWith("fn")) {
			return /* html */ `<div class="my-4 *:border *:border-base-700">${code}</div>`;
		}

		const fileName = `code.${lang ? lang : "txt"}`;
		const escaped = escape(token.content, true);
		const encoded = encodeURIComponent(token.content);

		return /* html */ `
<div class="bg-base-800 rounded-none sm:rounded-md -mx-4 in-[.chat-bubble]:-mx-3 sm:mx-0 my-8 font-mono font-light">
	<div class="flex justify-between items-center pt-px px-4 sm:px-2 border-b border-base-700">
		<div class="px-2 text-base-200 text-sm">${lang}</div>
		<div class="flex">
			${Share(escaped)}
			${Download({ fileName, encoded })}
		</div>
	</div>
	${code}
</div>
`.trim();
	};
};

const Download = (props: { fileName: string; encoded: string }) =>
	/* html */ `
<a 
	class="button icon bg-base-800 text-base-200 shadow-none"
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
		class="icon bg-base-800 text-base-200 shadow-none"
		aria-label="copy code to clipboard"
	>
		<span data-content class="contents">${svg.Copy()}</span>
		<template data-swap>${svg.CopyComplete()}</template>
	</button>
</drab-share>
`.trim();
