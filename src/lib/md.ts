import { Processor } from "@robino/md";
import langAstro from "@shikijs/langs/astro";
import langBash from "@shikijs/langs/bash";
import langCss from "@shikijs/langs/css";
import langHtml from "@shikijs/langs/html";
import langJson from "@shikijs/langs/json";
import langPy from "@shikijs/langs/py";
import langSql from "@shikijs/langs/sql";
import langSvelte from "@shikijs/langs/svelte";
import langTsx from "@shikijs/langs/tsx";
import langVue from "@shikijs/langs/vue";

export const processor = new Processor({
	highlighter: {
		langs: [
			langCss,
			langHtml,
			langTsx,
			langSvelte,
			langBash,
			langJson,
			langSql,
			langAstro,
			langPy,
			langVue,
		],
		langAlias: {
			js: "tsx",
			ts: "tsx",
			jsx: "tsx",
			mdx: "md",
		},
	},
});
