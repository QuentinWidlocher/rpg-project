import { A, useLocation } from "@solidjs/router";
import { ParentProps } from "solid-js";
import Layout from "~/components/Layout";
import { IconoirCheckCircleSolid } from "~/components/icons/CheckCircleSolid";
import { IconoirCircle } from "~/components/icons/Circle";
import { useModal } from "~/contexts/modal";
import { usePlayer } from "~/contexts/player";
import { BaseSkill, PlayerCharacter, Skill, getBaseSkill, getBaseSkillFromSkill, getProficiencyBonus, getSkillLabel, isSkillProficient } from "~/game/character/character";
import { skillModifier } from "~/utils/dice";

function SkillTable(props: ParentProps<{ title: string }>) {
  return (<>
    <thead>
      <tr>
        <th>{props.title}</th>
        <th>Proficient</th>
        <th>Bonus</th>
      </tr>
    </thead>
    <tbody>
      {props.children}
    </tbody>
  </>)
}

export function CharacterModal() {
  const { player } = usePlayer()
  const { close } = useModal()

  function Stat(props: { title: string, prop: BaseSkill }) {
    return (
      <div class="stats overflow-hidden aspect-square flex-1 shadow">
        <div class="stat place-items-center p-0 @sm:p-2">
          <div class="stat-title">{props.title}</div>
          <div class="stat-value">+ {skillModifier(getBaseSkill(player, props.prop))}</div>
          <div class="stat-desc">
            ( {getBaseSkill(player, props.prop)} )
          </div>
        </div>
      </div>
    )
  }

  function Skill(props: { skill: Skill }) {
    return (
      <tr>
        <td>{getSkillLabel(props.skill)}</td>
        <td>{isSkillProficient(player, props.skill) ? <IconoirCheckCircleSolid /> : <IconoirCircle />}</td>
        <td>+ {skillModifier(getBaseSkill(player, getBaseSkillFromSkill(props.skill))) + (isSkillProficient(player, props.skill) ? getProficiencyBonus(player) : 0)}</td>
      </tr>
    )
  }

  return <Layout hideStatusBar title={`${player.name}'s character sheet`}>
    <div class="grid gap-2 grid-cols-2 @sm:grid-cols-3 grid-flow-row">
      <Stat prop="strength" title="Strength" />
      <Stat prop="dexterity" title="Dexterity" />
      <Stat prop="constitution" title="Constitution" />
      <Stat prop="intelligence" title="Intelligence" />
      <Stat prop="wisdom" title="Wisdom" />
      <Stat prop="charisma" title="Charisma" />
    </div>

    <div class="overflow-visible bg-base-100 shadow">
      <div class="overflow-x-auto h-full">
        <table class="table table-pin-rows">
          <SkillTable title="Strength" >
            <Skill skill="athletics" />
          </SkillTable>
          <SkillTable title="Dexterity" >
            <Skill skill="acrobatics" />
            <Skill skill="sleightOfHand" />
            <Skill skill="stealth" />
          </SkillTable>
          <SkillTable title="Intelligence" >
            <Skill skill="arcana" />
            <Skill skill="history" />
            <Skill skill="investigation" />
            <Skill skill="nature" />
            <Skill skill="religion" />
          </SkillTable>
          <SkillTable title="Wisdom" >
            <Skill skill="animalHandling" />
            <Skill skill="insight" />
            <Skill skill="medecine" />
            <Skill skill="perception" />
            <Skill skill="survival" />
          </SkillTable>
          <SkillTable title="Charisma" >
            <Skill skill="deception" />
            <Skill skill="intimidation" />
            <Skill skill="performance" />
            <Skill skill="persuasion" />
          </SkillTable>
        </table>
      </div>
    </div>
    <button onClick={() => close()} class="btn btn-base mt-auto btn-block">Close this page</button>
  </Layout>
}
