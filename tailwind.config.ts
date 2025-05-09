import type { Config } from "tailwindcss";

export default {
	content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
	theme: {
		extend: {
			aria: {
				current: 'current="true"',
			},
			colors: {
				"base-400": "#97916c",
			},
			fontFamily: {
				serif: ["Platypi Variable", "serif"],
			},
		},
	},
} satisfies Config;
