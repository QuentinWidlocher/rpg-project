import { flatten, Flatten, ResolveArgs, resolveTemplate, translator } from "@solid-primitives/i18n";
import { createResource, createSignal } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";
import { dict as enDict } from "./dicts/en";
import { createRequiredContextProvider } from "~/utils/useRequiredContextProvider";
import { Leaves } from "~/utils/types";

export type Locale = "en" | "fr";

export type RawDictionary = typeof enDict;
export type Dictionary = Flatten<RawDictionary>;
export type DictionaryEntry = Leaves<RawDictionary>;

async function fetchDictionary(locale: Locale) {
	const importedDict: RawDictionary = (await import(`./dicts/${locale}.ts`)).dict;
	return flatten(importedDict);
}

export const [I18nProvider, useI18n] = createRequiredContextProvider(() => {
	const [locale, setLocale] = makePersisted(createSignal<Locale>("en"), { name: "locale" });
	const [dict] = createResource(locale, fetchDictionary, {
		initialValue: flatten(enDict),
	});

	const t = <K extends DictionaryEntry>(k: K, ...args: ResolveArgs<Dictionary[K], string>) =>
		translator(dict, resolveTemplate)(k, ...args);

	return {
		T: (props: { k: Leaves<RawDictionary>; v?: Parameters<typeof t>[1] }) => <>{t(props.k, props.v)}</>,
		locale,
		setLocale,
		t,
	};
}, "i18n");
