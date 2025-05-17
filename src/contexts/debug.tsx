import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { createEffect } from "solid-js";
import { Theme, useTheme } from "./theme";
import { createRequiredContextProvider } from "~/utils/useRequiredContextProvider";

export const [DebugProvider, useDebug] = createRequiredContextProvider(() => {
	const { setTheme, setForcedTheme } = useTheme();

	const [debug, setDebug] = makePersisted(
		createStore<{
			enabled: boolean;
			showDebugChallenges: boolean;
			forcedTheme: Theme | null;
		}>(
			{
				enabled: import.meta.env.MODE == "development",
				forcedTheme: null,
				showDebugChallenges: import.meta.env.MODE == "development",
			},
			{ name: "debug" },
		),
	);

	createEffect(function syncThemeBehavior() {
		if (debug.forcedTheme) {
			setForcedTheme(debug.forcedTheme);
		} else {
			setTheme("behavior", "auto");
		}
	});

	return { debug, setDebug };
}, "debug");
