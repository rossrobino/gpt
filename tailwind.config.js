import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		borderColor: {
			DEFAULT: "#d4d4d4",
			neutral: {
				700: "#404040",
			},
		},
		extend: {
			fontFamily: {
				antique: [
					"Superclarendon",
					"Bookman Old Style",
					"URW Bookman",
					"URW Bookman L",
					"Georgia Pro",
					"Georgia",
					"serif",
				],
			},
		},
	},
	plugins: [typography],
};
