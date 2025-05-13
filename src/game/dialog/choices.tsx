import { JSXElement } from "solid-js";
import { EmptyObject, JsonObject } from "type-fest";
import { BaseSkill, getSkillLabel, PlayerCharacter, Skill } from "../character/character";
import { ImmutableFunction, ImmutableStateFunctionParameters, MutableFunction } from "./dialog";
import { IconoirCheckCircle } from "~/components/icons/CheckCircle";
import { IconoirFastArrowRight } from "~/components/icons/FastArrowRight";
import { IconoirXmarkCircle } from "~/components/icons/XmarkCircle";
import { detailedSkillCheck, pickBestSkill } from "~/contexts/player";

export type Choice<State extends JsonObject = EmptyObject> = {
	text: JSXElement | ((props: ImmutableStateFunctionParameters<State> & { condition: boolean }) => JSXElement);
	effect?: MutableFunction<State>;
	skillCheck?: {
		character: PlayerCharacter;
		skill: BaseSkill | Skill;
		dd: number;
		outcome: { success?: MutableFunction<State>; failure?: MutableFunction<State> };
	};
} & (
	| {
			condition: ImmutableFunction<State, (boolean | { success: boolean; tooltip: string }) | undefined>;
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

export function skillCheckConditionChoice<State extends JsonObject>(
	character: PlayerCharacter,
	skill: (BaseSkill | Skill) | Array<BaseSkill | Skill>,
	dd: number,
	choice: Pick<Choice<State>, "text" | "effect" | "visibleOnFail">,
) {
	const chosenSkill = pickBestSkill(character, skill);

	return {
		condition: () => getSkillCheckCondition(character, chosenSkill, dd),
		effect: choice.effect,
		text: props => (
			<>
				<div class="mr-2">{props.condition ? <IconoirCheckCircle /> : <IconoirXmarkCircle />}</div>
				<span>
					{getSkillLabel(chosenSkill)} : {typeof choice.text == "function" ? choice.text(props) : choice.text}
				</span>
			</>
		),
		visibleOnFail: choice.visibleOnFail,
	} satisfies Choice<State>;
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
		skillCheck: {
			character,
			dd,
			outcome: { failure: choice.failure, success: choice.success },
			skill: chosenSkill,
		} satisfies Choice["skillCheck"],
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
	};
}

export const goTo: <State extends JsonObject>(id: string) => MutableFunction<State> = (id: string) => props =>
	props.setNext(id);
