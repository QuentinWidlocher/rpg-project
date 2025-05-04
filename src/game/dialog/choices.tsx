import { detailedSkillCheck, getSkillTotalModifier, pickBestSkill, skillCheck } from "~/contexts/player";
import { BaseSkill, getSkillLabel, PlayerCharacter, Skill } from "../character/character";
import { ImmutableFunction, ImmutableStateFunctionParameters, MutableFunction } from "./dialog";
import { JSXElement } from "solid-js";
import { IconoirCheckCircle } from "~/components/icons/CheckCircle";
import { IconoirXmarkCircle } from "~/components/icons/XmarkCircle";
import { IconoirFastArrowRight } from "~/components/icons/FastArrowRight";

export type Choice = {
	text: JSXElement | ((props: ImmutableStateFunctionParameters & { condition: boolean }) => JSXElement);
	effect?: MutableFunction;
	skillCheck?: {
		character: PlayerCharacter;
		skill: BaseSkill | Skill;
		dd: number;
		outcome: { success?: MutableFunction; failure?: MutableFunction };
	};
} & (
	| {
			condition: ImmutableFunction<(boolean | { success: boolean; tooltip: string }) | undefined>;
			visibleOnFail?: boolean;
	  }
	| {
			condition?: undefined;
			visibleOnFail?: undefined;
	  }
);

export function getSkillCheckCondition(
	character: PlayerCharacter,
	skill: (BaseSkill | Skill) | Array<BaseSkill | Skill>,
	dd: number,
) {
	const chosenSkill = pickBestSkill(character, skill);
	const check = detailedSkillCheck(character, chosenSkill, dd);
	return {
		success: check.success,
		tooltip: `${getSkillLabel(chosenSkill)} : ${check.roll + check.modifier + check.proficiency} vs. ${dd}`,
	} satisfies ReturnType<Choice["condition"] & {}>;
}

export function skillCheckConditionChoice(
	character: PlayerCharacter,
	skill: (BaseSkill | Skill) | Array<BaseSkill | Skill>,
	dd: number,
	choice: Pick<Choice, "text" | "effect" | "visibleOnFail">,
) {
	const chosenSkill = pickBestSkill(character, skill);

	return {
		text: props => (
			<>
				<div class="mr-2">{props.condition ? <IconoirCheckCircle /> : <IconoirXmarkCircle />}</div>
				<span>
					{getSkillLabel(chosenSkill)} : {typeof choice.text == "function" ? choice.text(props) : choice.text}
				</span>
			</>
		),
		condition: () => getSkillCheckCondition(character, chosenSkill, dd),
		effect: choice.effect,
		visibleOnFail: choice.visibleOnFail,
	} satisfies Choice;
}

export function skillCheckChoice(
	character: PlayerCharacter,
	skill: (BaseSkill | Skill) | Array<BaseSkill | Skill>,
	dd: number,
	choice: Choice & (Choice["skillCheck"] & {})["outcome"],
) {
	const chosenSkill = pickBestSkill(character, skill);

	return {
		...choice,
		text: (props => (
			<>
				<span>{typeof choice.text == "function" ? choice.text(props) : choice.text}</span>
				<div aria-disabled={!props.condition} class="ml-2 badge badge-outline badge-secondary aria-disabled:opacity-50">
					<IconoirFastArrowRight />
					<span class="mb-0.5">
						{getSkillLabel(chosenSkill)} : {dd}
					</span>
				</div>
			</>
		)) satisfies Choice["text"],
		skillCheck: {
			character,
			skill: chosenSkill,
			dd,
			outcome: { success: choice.success, failure: choice.failure },
		} satisfies Choice["skillCheck"],
	};
}

export const goTo: (id: string) => MutableFunction = (id: string) => props => props.setNext(id);
