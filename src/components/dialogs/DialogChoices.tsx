import { For } from "solid-js";
import { Choice, ImmutableStateFunctionParameters, MutableStateFunctionParameters, Scene } from "~/game/dialog/dialog";

export function DialogChoices(props: {
  choices: Scene['choices'],
  onChoiceClick: () => void,
  immutableFunctionProps: ImmutableStateFunctionParameters
  mutableFunctionProps: MutableStateFunctionParameters
}) {
  const choices = () => props.choices.map(choice => ({
    text: choice.text(props.immutableFunctionProps),
    effect: choice.effect,
    condition: choice.condition ? choice.condition(props.immutableFunctionProps) : true
  })).filter(choice => choice.condition && choice.text != '')

  function onChoiceClick(effect?: Choice['effect']) {
    effect?.(props.mutableFunctionProps)
    props.onChoiceClick()
  }

  return (
    <ul class="-m-4 mt-auto menu bg-base-300 rounded-xl gap-2">
      <For
        each={choices()}
        fallback={
          <li onClick={() => onChoiceClick()} class="btn btn-ghost hover:mix-blend-luminosity">Continuer</li>
        }
      >
        {choice =>
          <li onClick={() => onChoiceClick(choice.effect)} class="btn btn-ghost hover:mix-blend-luminosity">{choice.text}</li>
        }
      </For>
    </ul>
  )
}
