import type { Config } from "tailwindcss";

export default {
	content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
	theme: {
		extend: {
			aria: {
				current: 'current="true"',
			},
			fontFamily: {
				serif: ["Platypi Variable", "serif"],
			},
		},
	},
} satisfies Config;
