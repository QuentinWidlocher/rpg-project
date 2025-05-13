import { nanoid } from "nanoid";
import { JSXElement } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { JsonObject } from "type-fest";
import { Choice } from "./choices";

export type ImmutableFunction<State extends JsonObject, Return> = (
	props: ImmutableStateFunctionParameters<State>,
) => Return;

export type MutableFunction<State extends JsonObject, Return = void> = (
	props: MutableStateFunctionParameters<State>,
) => Return;

export type ImmutableStateFunctionParameters<State extends JsonObject> = {
	from: string | undefined;
	isFrom: (id: string) => boolean;
	next: string | undefined;
	state: State;
};

export type MutableStateFunctionParameters<State extends JsonObject> = ImmutableStateFunctionParameters<State> & {
	setNext: (id: string | undefined) => void;
	setIllustration: (props: { character?: string; background?: string }) => void;
	continue: () => void;
	setState: SetStoreFunction<State>;
};

export type Scene<State extends JsonObject> = {
	id: string;
	title: string | ImmutableFunction<State, string>;
	text: JSXElement | MutableFunction<State, JSXElement>;
	choices: Array<Choice<State> | undefined>;
	enterFunction?: MutableFunction<State>;
	exitFunction?: MutableFunction<State>;
};

type PartialScene<State extends JsonObject> = Omit<Scene<State>, "id" | "title" | "choices"> & Partial<Scene<State>>;

export function makeDialog<State extends JsonObject>(partialDialog: Array<PartialScene<State>>): Array<Scene<State>> {
	let result: Array<Scene<State>> = [];

	let i = 0;
	for (const scene of partialDialog) {
		result.push({
			id: nanoid(),
			title: result[i - 1]?.title ?? (() => ""),
			...scene,
			choices: (scene.choices ?? []).filter(Boolean),
			text: scene.text,
		});

		i++;
	}

	return result;
}
