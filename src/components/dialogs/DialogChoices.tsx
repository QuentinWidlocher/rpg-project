import { createSignal, For } from "solid-js";
import { twJoin } from "tailwind-merge";
import { detailedSkillCheck, skillCheck } from "~/contexts/player";
import { Choice } from "~/game/dialog/choices";
import { ImmutableStateFunctionParameters, MutableStateFunctionParameters, Scene } from "~/game/dialog/dialog";
import { SkillCheckDiceThrowModal, SkillCheckProps } from "./SkillCheckDiceThrowModal";

export function DialogChoices(props: {
  choices: Required<Scene["choices"]>;
  onChoiceClick: () => void;
  immutableFunctionProps: ImmutableStateFunctionParameters;
  mutableFunctionProps: MutableStateFunctionParameters;
}) {
  const [diceThrowModal, setDiceThrowModal] = createSignal<SkillCheckProps | null>(null);
  const [diceThrowModalCallback, setDiceThrowModalCallback] = createSignal<() => void>(() => { });

  const choices = () =>
    props.choices
      .map(choice => {
        const conditionResult = choice.condition?.(props.immutableFunctionProps)
        let condition = true
        let tooltip: string | undefined

        if (conditionResult != null) {
          if (typeof conditionResult == 'object') {
            condition = conditionResult.success
            tooltip = conditionResult.tooltip
          } else {
            condition = conditionResult || false
          }
        }

        return {
          ...choice,
          condition,
          tooltip,
          text: typeof choice.text == 'function' ? choice.text({ ...props.immutableFunctionProps, condition }) : choice.text,
        };
      })
      .filter(choice => (choice.condition || choice.visibleOnFail) && choice.text != "" && choice.text != <></>);

  function onChoiceClick(effect?: Choice["effect"]) {
    effect?.(props.mutableFunctionProps);
    props.onChoiceClick();
  }

  return (
    <>
      <SkillCheckDiceThrowModal
        values={diceThrowModal()}
        onClose={() => {
          diceThrowModalCallback()();
          setDiceThrowModal(null);
        }}
      />
      <ul class="mt-auto menu menu-lg w-full bg-base-300 rounded-box gap-1">
        <For
          each={choices()}
          fallback={
            <li>
              <button class="p-3" onClick={() => onChoiceClick()}>
                Continue
              </button>
            </li>
          }
        >
          {choice => (
            <li class={twJoin(!choice.condition && "text-base-content/50", choice.tooltip && "tooltip")}>
              {choice.tooltip ? (
                <div class="tooltip-content">
                  {choice.tooltip}
                </div>
              ) : undefined}
              <button
                class={twJoin("p-3", !choice.condition && "cursor-default hover:bg-transparent active:bg-transparent! active:text-base-content/50! focus:bg-transparent")}
                onClick={() => {
                  if (choice.condition) {
                    if (choice.skillCheck) {
                      const { roll, modifier, proficiency, success } = detailedSkillCheck(choice.skillCheck.character, choice.skillCheck.skill, choice.skillCheck.dd)

                      setDiceThrowModalCallback(() => () => {
                        if (success) {
                          choice.skillCheck?.outcome.success?.(props.mutableFunctionProps)
                        } else {
                          choice.skillCheck?.outcome.failure?.(props.mutableFunctionProps)
                        }

                        onChoiceClick(choice.effect);
                      })
                      setDiceThrowModal({
                        dd: choice.skillCheck.dd,
                        modifier,
                        proficiency,
                        roll,
                        skill: choice.skillCheck.skill,
                        success,
                      });

                    } else {
                      // Simple choice
                      onChoiceClick(choice.effect);
                    }
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
    </>
  );
}
