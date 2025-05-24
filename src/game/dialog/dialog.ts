import { nanoid } from "nanoid";
import { JSXElement } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { JsonObject } from "type-fest";
import { Choice, skillCheckChoice } from "./choices";

export type ImmutableFunction<State extends JsonObject, Keys extends string, Return> = (
	props: ImmutableStateFunctionParameters<State, Keys>,
) => Return;

export type MutableFunction<State extends JsonObject, Keys extends string, Return = void> = (
	props: MutableStateFunctionParameters<State, Keys>,
) => Return;

export type ImmutableStateFunctionParameters<State extends JsonObject, Keys extends string> = {
	from: Keys | undefined;
	isFrom: (id: Keys) => boolean;
	next: Keys | undefined;
	state: State;
};

export type MutableStateFunctionParameters<
	State extends JsonObject,
	Keys extends string,
> = ImmutableStateFunctionParameters<State, Keys> & {
	setNext: (id: number | Keys | undefined) => void;
	setIllustration: (props: { character?: string; background?: string }) => void;
	continue: () => Promise<void>;
	setState: SetStoreFunction<State>;
};

export type ChoiceDeclaration<State extends JsonObject, Keys extends string> = Array<
	ImmutableFunction<State, Keys, Choice<State, Keys> | undefined> | Choice<State, Keys> | undefined
>;

export type Scene<State extends JsonObject, Keys extends string> = {
	id: Keys;
	title: string | ImmutableFunction<State, Keys, string>;
	text: JSXElement | MutableFunction<State, Keys, JSXElement>;
	choices:
		| ChoiceDeclaration<State, Keys>
		| ((
				props: ImmutableStateFunctionParameters<State, Keys> & { skillCheckChoice: typeof skillCheckChoice<State, Keys> },
		  ) => ChoiceDeclaration<State, Keys>);
	enterFunction?: MutableFunction<State, Keys>;
	exitFunction?: MutableFunction<State, Keys>;
};

export type PartialScene<State extends JsonObject, Keys extends string> = Omit<
	Scene<State, Keys>,
	"id" | "title" | "choices"
> &
	Partial<Scene<State, Keys>>;

export function makeDialog<State extends JsonObject, Keys extends string>(
	partialDialog: Array<PartialScene<State, Keys>>,
): Array<Scene<State, Keys>> {
	let result: Array<Scene<State, Keys>> = [];

	let i = 0;
	for (const scene of partialDialog) {
		result.push({
			id: nanoid(),
			title: result[i - 1]?.title ?? "",
			...scene,
			choices: typeof scene.choices == "function" ? scene.choices : (scene.choices ?? []).filter(Boolean),
			text: scene.text,
		});

		i++;
	}

	return result;
}
