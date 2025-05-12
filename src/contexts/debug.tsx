import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { createRequiredContextProvider } from "~/utils/useRequiredContextProvider";

export const [DebugProvider, useDebug] = createRequiredContextProvider(() => {
	const [debug, setDebug] = makePersisted(
		createStore(
			{
				showDebugChallenges: true,
				showStatusBar: false,
			},
			{ name: "debug" },
		),
	);

	return { debug, setDebug };
});
