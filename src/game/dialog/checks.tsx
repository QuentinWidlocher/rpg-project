import { detailedSkillCheck, pickBestSkill, skillCheck } from "~/contexts/player";
import { BaseSkill, getSkillLabel, PlayerCharacter, Skill } from "../character/character";
import { IconoirCheckCircle } from "~/components/icons/CheckCircle";
import { IconoirXmarkCircle } from "~/components/icons/XmarkCircle";
import { twJoin } from "tailwind-merge";
import { JSXElement, Show } from "solid-js";

export function SkillCheck(props: {
  children: JSXElement;
  character: PlayerCharacter,
  skill: (BaseSkill | Skill) | Array<BaseSkill | Skill>,
  dd: number,
  visibleOnFail?: boolean
}) {
  const chosenSkill = pickBestSkill(props.character, props.skill)
  const check = detailedSkillCheck(props.character, chosenSkill, props.dd)

  return <Show when={check.success || props.visibleOnFail}>
    <div class={twJoin("mr-2 badge badge-lg badge-outline tooltip", check.success ? 'badge-success' : 'badge-error')}>
      <div class="tooltip-content">
        {getSkillLabel(chosenSkill)} : {check.roll + check.modifier + check.proficiency} vs. {props.dd}
      </div>
      {check.success ? <IconoirCheckCircle /> : <IconoirXmarkCircle />}
      <span class="mb-0.5">{getSkillLabel(chosenSkill)} : {props.dd}</span>
    </div>
    {props.children}
  </Show>
}
