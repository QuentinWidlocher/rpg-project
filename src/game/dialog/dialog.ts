import { nanoid } from "nanoid";
import { JSXElement } from "solid-js";
import { Choice } from "./choices";

export type ImmutableFunction<Return> = (props: ImmutableStateFunctionParameters) => Return;

export type MutableFunction = (props: MutableStateFunctionParameters) => void;

export type ImmutableStateFunctionParameters = {
	from: string | undefined;
	isFrom: (id: string) => boolean;
	next: string | undefined;
};

export type MutableStateFunctionParameters = ImmutableStateFunctionParameters & {
	setNext: (id: string | undefined) => void;
	setIllustration: (props: { character?: string; background?: string }) => void;
	continue: () => void;
};

export type Scene = {
	id: string;
	title: string | ImmutableFunction<string>;
	text: JSXElement | ImmutableFunction<JSXElement>;
	choices: Array<Choice | undefined>; // So we can conditionnaly remove choices
	enterFunction?: MutableFunction;
	exitFunction?: MutableFunction;
};

export type Dialog = Array<Scene>;

type PartialScene = Omit<Scene, "id" | "title" | "choices"> & Partial<Scene>;

export type PartialDialog = Array<PartialScene>;

export function makeDialog(partialDialog: PartialDialog): Dialog {
	let result: Dialog = [];

	let i = 0;
	for (const scene of partialDialog) {
		result.push({
			id: nanoid(),
			title: result[i - 1]?.title ?? (() => ""),
			...scene,
			choices: (scene.choices ?? []).filter(Boolean),
		});

		i++;
	}

	return result;
}
