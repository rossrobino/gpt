/// <reference types="vite/client" />
/// <reference types="domco/env" />

interface ImportMetaEnv {
	readonly VITE_OPENAI_API_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
