/// <reference types="vite/client" />
/// <reference types="domco/env" />

interface ImportMetaEnv {
	readonly VITE_OPENAI_API_KEY: string;
	readonly VITE_CF_API_KEY: string;
	readonly VITE_CF_ACCOUNT_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "*.md" {
	import type { Heading } from "@robino/md";

	export const html: string;
	export const article: string;
	export const headings: Heading[];
}

declare module "build:time" {
	export const time: string;
}
