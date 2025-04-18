import { skillCheck } from "~/contexts/player";
import { BaseSkill, getSkillLabel, PlayerCharacter, Skill } from "../character/character";
import { ImmutableFunction, ImmutableStateFunctionParameters, MutableFunction } from "./dialog";
import { JSXElement } from "solid-js";
import { IconoirCheckCircle } from "~/components/icons/CheckCircle";
import { IconoirXmarkCircle } from "~/components/icons/XmarkCircle";

export type Choice = {
	text: (props: ImmutableStateFunctionParameters & { condition: boolean }) => JSXElement;
	effect?: MutableFunction;
} & (
	| {
			condition: ImmutableFunction<boolean | undefined>;
			visibleOnFail?: boolean;
	  }
	| {
			condition?: undefined;
			visibleOnFail?: undefined;
	  }
);

export function skillCheckChoice(
	character: PlayerCharacter,
	skill: BaseSkill | Skill,
	dd: number,
	choice: Pick<Choice, "text" | "effect" | "visibleOnFail">,
): Choice {
	return {
		text: props => (
			<>
				<div class="mr-2">{props.condition ? <IconoirCheckCircle /> : <IconoirXmarkCircle />}</div>
				<span>
					{getSkillLabel(skill)} : {choice.text(props)}
				</span>
			</>
		),
		condition: () => skillCheck(character, skill, dd),
		effect: choice.effect,
		visibleOnFail: choice.visibleOnFail,
	};
}
