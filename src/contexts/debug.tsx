import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { createRequiredContextProvider } from "~/utils/useRequiredContextProvider";

export const [DebugProvider, useDebug] = createRequiredContextProvider(() => {
	const [debug, setDebug] = makePersisted(
		createStore(
			{
				enabled: import.meta.env.MODE == "development",
				showDebugChallenges: import.meta.env.MODE == "development",
			},
			{ name: "debug" },
		),
	);

	return { debug, setDebug };
});
