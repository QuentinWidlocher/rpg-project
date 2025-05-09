import { ParentProps } from "solid-js";
import { IconoirCheckCircleSolid } from "../../icons/CheckCircleSolid";
import { IconoirCircle } from "../../icons/Circle";
import { usePlayer } from "~/contexts/player";
import {
	BaseSkill,
	getArmorClass,
	getBaseSkill,
	getBaseSkillFromSkill,
	getInitiativeBonus,
	getMaxHp,
	getProficiencyBonus,
	getSkillLabel,
	isSkillProficient,
	Skill,
} from "~/game/character/character";
import { getClassLabel } from "~/game/character/classes/classes";
import { skillModifier } from "~/utils/dice";

function SkillTable(props: ParentProps<{ title: string }>) {
	return (
		<>
			<thead>
				<tr>
					<th>{props.title}</th>
					<th>Proficient</th>
					<th>Bonus</th>
				</tr>
			</thead>
			<tbody>{props.children}</tbody>
		</>
	);
}

export default function StatsAndSkillsPage() {
	const { player } = usePlayer();

	function Stat(props: { title?: string; prop: BaseSkill }) {
		return (
			<div class="stats bg-base-100 overflow-hidden aspect-square flex-1 shadow-sm">
				<div class="stat place-items-center p-0 @sm:p-2">
					<div class="stat-title font-bold text-sm">{props.title ?? getSkillLabel(props.prop)}</div>
					<div class="stat-value">+ {skillModifier(getBaseSkill(player, props.prop))}</div>
					<div class="stat-desc">( {getBaseSkill(player, props.prop)} )</div>
				</div>
			</div>
		);
	}

	function Skill(props: { skill: Skill }) {
		return (
			<tr>
				<td>{getSkillLabel(props.skill)}</td>
				<td>{isSkillProficient(player, props.skill) ? <IconoirCheckCircleSolid /> : <IconoirCircle />}</td>
				<td class="tabular-nums">
					+{" "}
					{skillModifier(getBaseSkill(player, getBaseSkillFromSkill(props.skill))) +
						(isSkillProficient(player, props.skill) ? getProficiencyBonus(player) : 0)}
				</td>
			</tr>
		);
	}

	return (
		<div class="flex flex-col gap-5">
			<div class="mb-5 mx-5">
				<div class="flex justify-between items-baseline">
					<span class="text-2xl">{player.name}</span>
					<span class="text-lg">
						{getClassLabel(player.class)} lv.{player.level}
					</span>
				</div>
				<progress class="progress progress-neutral w-full" value={player.xp.current} max={player.xp.next}></progress>
				<div class="flex justify-between mx-5">
					<span>Current: {player.xp.current} XP</span>
					<span>Next: {player.xp.next} XP</span>
				</div>
			</div>

			<div>
				<div class="stats bg-base-100 overflow-hidden w-full flex-1 shadow-sm">
					<div class="stat place-items-center p-0 @sm:p-2">
						<div class="stat-title">Max HP</div>
						<div class="stat-value">{getMaxHp(player)}</div>
					</div>
					<div class="stat place-items-center p-0 @sm:p-2">
						<div class="stat-title">Armor Class</div>
						<div class="stat-value">{getArmorClass(player)}</div>
					</div>
					<div class="stat place-items-center p-0 @sm:p-2">
						<div class="stat-title">Initiative</div>
						<div class="stat-value">+ {getInitiativeBonus(player)}</div>
					</div>
				</div>
			</div>

			<div class="grid gap-2 grid-cols-2 @sm:grid-cols-3 grid-flow-row">
				<Stat prop="strength" />
				<Stat prop="dexterity" />
				<Stat prop="constitution" />
				<Stat prop="intelligence" />
				<Stat prop="wisdom" />
				<Stat prop="charisma" />
			</div>

			<div class="overflow-visible bg-base-100 rounded-box shadow-sm">
				<div class="overflow-x-auto h-full rounded-box">
					<table class="table table-pin-rows rounded-box">
						<SkillTable title="Strength">
							<Skill skill="athletics" />
						</SkillTable>
						<SkillTable title="Dexterity">
							<Skill skill="acrobatics" />
							<Skill skill="sleightOfHand" />
							<Skill skill="stealth" />
						</SkillTable>
						<SkillTable title="Intelligence">
							<Skill skill="arcana" />
							<Skill skill="history" />
							<Skill skill="investigation" />
							<Skill skill="nature" />
							<Skill skill="religion" />
						</SkillTable>
						<SkillTable title="Wisdom">
							<Skill skill="animalHandling" />
							<Skill skill="insight" />
							<Skill skill="medecine" />
							<Skill skill="perception" />
							<Skill skill="survival" />
						</SkillTable>
						<SkillTable title="Charisma">
							<Skill skill="deception" />
							<Skill skill="intimidation" />
							<Skill skill="performance" />
							<Skill skill="persuasion" />
						</SkillTable>
					</table>
				</div>
			</div>
		</div>
	);
}
