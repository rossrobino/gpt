import { Processor } from "@robino/md";
import langAstro from "@shikijs/langs/astro";
import langBash from "@shikijs/langs/bash";
import langC from "@shikijs/langs/c";
import langCpp from "@shikijs/langs/cpp";
import langCsharp from "@shikijs/langs/csharp";
import langCss from "@shikijs/langs/css";
import langGo from "@shikijs/langs/go";
import langHtml from "@shikijs/langs/html";
import langJava from "@shikijs/langs/java";
import langJson from "@shikijs/langs/json";
import langPhp from "@shikijs/langs/php";
import langPy from "@shikijs/langs/py";
import langRust from "@shikijs/langs/rs";
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
			langJava,
			langRust,
			langC,
			langCpp,
			langGo,
			langCsharp,
			langPhp,
		],
		langAlias: {
			js: "tsx",
			ts: "tsx",
			jsx: "tsx",
			mdx: "md",
		},
	},
});
