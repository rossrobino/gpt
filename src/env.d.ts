/// <reference types="vite/client" />
/// <reference types="domco/env" />

declare module "*.md" {
	import type { Heading } from "@robino/md";

	export const html: string;
	export const article: string;
	export const headings: Heading[];
}

declare module "build:time" {
	export const time: string;
}
