import { adapter } from "@domcojs/vercel";
import { md } from "@robino/md";
import tailwindcss from "@tailwindcss/vite";
import { domco } from "domco";
import { defineConfig, type Plugin } from "vite";

const buildTime = (): Plugin => {
	const name = "build:time";
	const resolvedId = `\0${name}`;

	return {
		name,
		resolveId: (id) => (id === name ? resolvedId : null),
		load: (id) =>
			id === resolvedId ? `export const time = "${Date.now()}"` : null,
	};
};

export default defineConfig({
	build: { minify: true },
	plugins: [domco({ adapter: adapter() }), tailwindcss(), md(), buildTime()],
});
