import { makePersisted } from "@solid-primitives/storage";
import { at } from "lodash-es";
import { ParentProps, createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { Leaves } from "~/utils/types";

export const flagTemplate = {
	act0: {
		defeatedTheBandit: false,
		helpedTheOldMan: false,
	},
	cutscene: {
		act0: false,
		arena: false,
		intro: false,
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

export type FlagsContext = {
	flags: Flags;
	getFlag: (flagName: FlagName) => boolean;
	setFlag: (flagName: FlagName, value?: boolean) => void;
};

export const FlagsContext = createContext<FlagsContext>();

export function FlagsProvider(props: ParentProps) {
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
	return <FlagsContext.Provider value={{ flags, getFlag, setFlag }}>{props.children}</FlagsContext.Provider>;
}

export function useFlags() {
	const context = useContext(FlagsContext);

	if (context == null) {
		throw new Error("You must use `useFlags` inside a `<FlagsProvider/>`");
	}

	return context;
}
