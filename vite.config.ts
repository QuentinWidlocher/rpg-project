import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
	plugins: [
		VitePWA({
			includeAssets: ["favicon.ico"],
			manifest: {
				name: "RPG Project",
				short_name: "RPG Project",
				description: "RPG Project",
				theme_color: "#ffffff",
				start_url: "/",
				icons: [
					{
						src: "/pwa-64x64.png",
						sizes: "64x64",
						type: "image/png",
					},
					{
						src: "/pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
					{
						src: "/maskable-icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
				],
			},
			devOptions: {
				enabled: true,
			},
		}),
	],
	esbuild: {
		drop: mode == "production" ? ["console", "debugger"] : [],
	},
}));
