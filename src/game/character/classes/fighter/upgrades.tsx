import { sum } from "lodash-es";
import { createEffect, Show } from "solid-js";
import {
	check,
	flatten,
	forward,
	getDefaults,
	InferOutput,
	literal,
	object,
	optional,
	pipe,
	safeParse,
	union,
} from "valibot";
import { createStore } from "solid-js/store";
import { createAbilityByLevel } from "../../actions-helpers";
import { BaseSkill } from "../../character";
import { createModifierByLevel } from "../../modifiers";
import { UpgradesByClassByLevel } from "../upgrades";

export const fighterUpgradesByLevel = {
	1: { abilities: [createAbilityByLevel("secondWind", { props: { maxUsage: 1 } })], modifiers: [] },
	2: { abilities: [createAbilityByLevel("actionSurge", { props: { maxUsage: 1 } })], modifiers: [] },
	4: {
		abilities: [],
		modifiers: [
			createModifierByLevel("abilityScoreImprovement", {
				form: props => {
					const schema = pipe(
						object({
							skills: object({
								charisma: optional(union([literal(0), literal(1), literal(2)], "Charisma must be 0, 1 or 2"), 0),
								constitution: optional(union([literal(0), literal(1), literal(2)], "Constitution must be 0, 1 or 2"), 0),
								dexterity: optional(union([literal(0), literal(1), literal(2)], "Dexterity must be 0, 1 or 2"), 0),
								intelligence: optional(union([literal(0), literal(1), literal(2)], "Intelligence must be 0, 1 or 2"), 0),
								strength: optional(union([literal(0), literal(1), literal(2)], "Strength must be 0, 1 or 2"), 0),
								wisdom: optional(union([literal(0), literal(1), literal(2)], "Wisdom must be 0, 1 or 2"), 0),
							}),
						}),
						forward(
							check(input => sum(Object.values(input.skills).filter(Boolean)) == 2, "You need to spend exactly two points."),
							["skills"],
						),
					);

					const [formValues, setFormValues] = createStore<InferOutput<typeof schema>>(
						getDefaults(schema) as unknown as InferOutput<typeof schema>,
					);

					const validation = () => safeParse(schema, formValues);

					createEffect(() => {
						props.onFormChanged(validation());
					});

					function ValueSelector(props: { title: string; prop: BaseSkill }) {
						return (
							<div class="flex-1 p-3 rounded-box bg-base-300 flex flex-col gap-2">
								<span>{props.title}</span>
								<input
									value={formValues["skills"][props.prop]}
									onChange={e => setFormValues("skills", props.prop, (e.currentTarget.valueAsNumber || 0) as 0 | 1 | 2)}
									type="number"
									min={0}
									max={2}
									class="input w-full"
								/>
							</div>
						);
					}

					return (
						<div>
							<div class="mb-5">
								<Show when={validation().issues}>
									{issues => (
										<ul>
											{Object.values(flatten(issues()).nested ?? {})?.map(error => (
												<li>{String(error)}</li>
											))}
										</ul>
									)}
								</Show>
							</div>
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
