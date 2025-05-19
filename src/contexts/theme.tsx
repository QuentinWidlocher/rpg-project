import { createDateNow } from "@solid-primitives/date";
import { makePersisted } from "@solid-primitives/storage";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { createRequiredContextProvider } from "~/utils/useRequiredContextProvider";

export const themes = ["dusk", "day", "dawn", "night"] as const;
export type Theme = (typeof themes)[number];

export const themeByTime = {
	6: "dawn",
	9: "day",
	18: "dusk",
	21: "night",
} satisfies Record<number, Theme>;

export const [ThemeProvider, useTheme] = createRequiredContextProvider(() => {
	const [now] = createDateNow(60_000); // Update every minutes

	const [theme, setTheme] = makePersisted(
		createStore<{ value: Theme; behavior: "auto" | "manual" }>({
			behavior: "auto",
			value: "day",
		}),
		{ name: "theme" },
	);

	function refreshAutoTheme() {
		const hour = now().getHours();

		const chosenTheme = Object.entries(themeByTime).reduce((chosenTheme, [threshold, themeName]) => {
			if (hour >= Number(threshold)) {
				return themeName;
			} else {
				return chosenTheme;
			}
		}, "night" as Theme);

		setTheme("value", chosenTheme);
	}

	createEffect(function syncTheme() {
		if (theme.behavior == "auto") {
			refreshAutoTheme();
		}
	});

	function setForcedTheme(theme: Theme) {
		setTheme("value", theme);
		setTheme("behavior", "manual");
	}

	return { setForcedTheme, setTheme, theme };
}, "debug");
