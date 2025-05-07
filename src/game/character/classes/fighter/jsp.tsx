import { createSignal } from "solid-js";
import { createAbilityByLevel } from "../../actions-helpers";
import { createModifierByLevel } from "../../modifiers";
import { modifiers } from "../../modifier-list";
import { UpgradesByClassByLevel } from "../upgrades";
import { BaseSkill } from "../../character";
import { sum } from "lodash-es";

// Idk why but if it's not a function, it runs before modifiers is created and
export const fighterUpgradesByLevel = {
	1: { abilities: [createAbilityByLevel("secondWind", { props: { maxUsage: 1 } })], modifiers: [] },
	2: { abilities: [createAbilityByLevel("actionSurge", { props: { maxUsage: 1 } })], modifiers: [] },
	4: {
		abilities: [],
		modifiers: [
			createModifierByLevel("abilityScoreImprovement", {
				form: () => {
					const [baseSkillValues, setBaseSkillValues] = createSignal<Record<BaseSkill, number>>({
						strength: 0,
						dexterity: 0,
						wisdom: 0,
						charisma: 0,
						constitution: 0,
						intelligence: 0,
					});
					const usedPoints = () => sum(Object.values(baseSkillValues()));
					function ValueSelector(props: { title: string; prop: BaseSkill }) {
						return (
							<div class="flex-1 p-3 rounded-box bg-base-300 flex flex-col gap-2">
								<span>{props.title}</span>
								<input
									min={0}
									max={2}
									disabled={usedPoints() >= 2}
									type="number"
									class="input w-full"
									value={baseSkillValues()[props.prop]}
									onInput={e => {
										setBaseSkillValues(prev => ({
											...prev,
											[props.prop]: e.currentTarget.valueAsNumber,
										}));
									}}
								/>
							</div>
						);
					}
					const form = (
						<div>
							<div class="flex gap-2 flex-wrap">
								<ValueSelector prop="strength" title="Strength" />
								<ValueSelector prop="dexterity" title="Dexterity" />
								<ValueSelector prop="constitution" title="Constitution" />
								<ValueSelector prop="intelligence" title="Intelligence" />
								<ValueSelector prop="wisdom" title="Wisdom" />
								<ValueSelector prop="charisma" title="Charisma" />
							</div>
						</div>
					);
					return { element: form, getValues: () => ({ skills: baseSkillValues() as Partial<Record<BaseSkill, 1 | 2>> }) };
				},
			}),
		],
	},
	17: {
		abilities: [
			createAbilityByLevel("actionSurge", { props: { maxUsage: 2 } }, "You can use Action Surge twice before a rest"),
		],
		modifiers: [],
	},
} satisfies UpgradesByClassByLevel["fighter"];
