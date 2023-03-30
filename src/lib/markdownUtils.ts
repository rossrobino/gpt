import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { micromark } from "micromark";

export const mdToHtml = (md: string) => {
	return micromark(md);
};

export const htmlToMd = async (html: string) => {
	const md = await unified()
		.use(rehypeParse)
		.use(rehypeRemark)
		.use(remarkStringify)
		.process(html);

	return String(md);
};
