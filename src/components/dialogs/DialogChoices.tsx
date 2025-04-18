import { For } from "solid-js";
import { twJoin } from "tailwind-merge";
import { Choice } from "~/game/dialog/choices";
import { ImmutableStateFunctionParameters, MutableStateFunctionParameters, Scene } from "~/game/dialog/dialog";

export function DialogChoices(props: {
	choices: Required<Scene["choices"]>;
	onChoiceClick: () => void;
	immutableFunctionProps: ImmutableStateFunctionParameters;
	mutableFunctionProps: MutableStateFunctionParameters;
}) {
	const choices = () =>
		props.choices
			.map(choice => {
				const condition = choice.condition ? choice.condition(props.immutableFunctionProps) || false : true;
				return {
					text: choice.text({ ...props.immutableFunctionProps, condition }),
					effect: choice.effect,
					condition,
					visibleOnFail: choice.visibleOnFail,
				};
			})
			.filter(choice => (choice.condition || choice.visibleOnFail) && choice.text != "" && choice.text != <></>);

	function onChoiceClick(effect?: Choice["effect"]) {
		effect?.(props.mutableFunctionProps);
		props.onChoiceClick();
	}

	return (
		<ul class="mt-auto menu menu-lg w-full bg-base-300 rounded-box gap-1">
			<For
				each={choices()}
				fallback={
					<li>
						<button class="p-3" onClick={() => onChoiceClick()}>
							Continuer
						</button>
					</li>
				}
			>
				{choice => (
					<li class={choice.condition ? "" : "menu-disabled"}>
						<button
							class="p-3"
							onClick={() => {
								if (choice.condition) {
									onChoiceClick(choice.effect);
								}
							}}
							disabled={!choice.condition}
						>
							{choice.text}
						</button>
					</li>
				)}
			</For>
		</ul>
	);
}
