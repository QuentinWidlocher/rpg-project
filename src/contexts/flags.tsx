import { makePersisted } from "@solid-primitives/storage";
import { at } from "lodash-es";
import { createStore } from "solid-js/store";
import { Leaves } from "~/utils/types";
import { createRequiredContextProvider } from "~/utils/useRequiredContextProvider";

export const flagTemplate = {
	act0: {
		defeatedTheBandit: false,
		helpedTheOldMan: false,
	},
	cutscene: {
		act0: false,
		arena: false,
		characterCreation: false,
	},
	npc: {
		inn: {
			gotName: false,
			greeted: false,
			restedOnce: false,
		},
		shopkeeper: {
			gotName: false,
			greeted: false,
		},
	},
};

export type Flags = typeof flagTemplate;

export type FlagName = Leaves<Flags> & {};

export const [FlagsProvider, useFlags] = createRequiredContextProvider(() => {
	const [flags, setFlags] = makePersisted(createStore<Flags>(flagTemplate), {
		name: "flags",
	});

	const getFlag = (flagName: FlagName) => at<boolean>(flags, flagName)[0] ?? false;

	const setFlag = (flagName: FlagName, value?: boolean) => {
		const fullPath = flagName.split(".");
		let path = [];

		for (const node of fullPath) {
			path.push(node);

			if (path.length == fullPath.length) {
				setFlags(...(path as [any]), value ?? true);
				return;
			}
		}
	};

	return { flags, getFlag, setFlag };
}, "flags");
