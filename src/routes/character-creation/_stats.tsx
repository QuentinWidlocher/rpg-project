import { inRange } from "lodash-es";
import {
	check,
	nonEmpty,
	nonNullish,
	number,
	object,
	optional,
	picklist,
	pipe,
	required,
	safeParse,
	string,
	toMaxValue,
	toMinValue,
} from "valibot";
import { SetStoreFunction } from "solid-js/store";
import { Owner, runWithOwner } from "solid-js";
import { CharacterCreationState } from ".";
import { usePlayer } from "~/contexts/player";
import { BaseSkill, PlayerCharacter } from "~/game/character/character";
import { Class, classConfigs, classes, getClassLabel } from "~/game/character/classes/classes";
import { upgradesByClassByLevel } from "~/game/character/classes/upgrades";
import { createModifierRef, ModifierRef } from "~/game/character/modifiers";
import { PartialScene } from "~/game/dialog/dialog";
import { skillModifier } from "~/utils/dice";

function mapValuesToPoints(value: number) {
	switch (value) {
		case 8:
			return 0;
		case 9:
			return 1;
		case 10:
			return 2;
		case 11:
			return 3;
		case 12:
			return 4;
		case 13:
			return 5;
		case 14:
			return 7;
		case 15:
			return 9;
		default:
			return NaN;
	}
}

const formSchema = object({
	baseSkillValues: pipe(
		required(
			object({
				charisma: pipe(number("You need to set your charisma."), toMinValue(0), toMaxValue(15)),
				constitution: pipe(number("You need to set your constitution."), toMinValue(0), toMaxValue(15)),
				dexterity: pipe(number("You need to set your dexterity."), toMinValue(0), toMaxValue(15)),
				intelligence: pipe(number("You need to set your intelligence."), toMinValue(0), toMaxValue(15)),
				strength: pipe(number("You need to set your strength."), toMinValue(0), toMaxValue(15)),
				wisdom: pipe(number("You need to set your wisdom."), toMinValue(0), toMaxValue(15)),
			}),
		),
		check(
			input => Object.values(input).reduce((acc, skill) => acc + mapValuesToPoints(skill), 0) == 27,
			"You must use exactly 27 points",
		),
	),
	class: optional(picklist(classes), "fighter"),
	name: pipe(nonNullish(string()), nonEmpty("I need your name.")),
});

const id = "character-infos";

export function statPage(pageProps: {
	owner: Owner;
	setModifiers: SetStoreFunction<Record<string, PlayerCharacter["modifiers"]>>;
}): PartialScene<CharacterCreationState> {
	return runWithOwner(pageProps.owner, () => {
		const { player, setPlayer } = usePlayer();

		const usedPoints = (baseSkillValues: CharacterCreationState["baseSkillValues"]) =>
			Object.values(baseSkillValues).reduce((acc, skill) => acc + mapValuesToPoints(skill), 0);

		return {
			choices: [
				{
					condition: props => {
						const result = safeParse(formSchema, {
							baseSkillValues: props.state.baseSkillValues,
							class: player.class,
							name: player.name,
						});
						console.debug("result.issues", result.issues);
						return result.success
							? true
							: {
									success: result.success,
									tooltip: result.issues[0].message,
							  };
					},
					text: props => {
						const points = usedPoints(props.state.baseSkillValues);
						if (points == 27 || isNaN(points)) {
							return "Continue";
						} else {
							const delta = 27 - points;

							if (delta > 0) {
								return `Continue (${delta} points left)`;
							} else {
								return `Continue (${Math.abs(delta)} extra points used)`;
							}
						}
					},
					visibleOnFail: true,
				},
			],
			exitFunction: props => {
				if (
					safeParse(formSchema, {
						baseSkillValues: props.state.baseSkillValues,
						class: player.class,
						name: player.name,
					}).success
				) {
					pageProps.setModifiers(id, [
						...Object.entries(props.state.baseSkillValues).map(([skill, value]) =>
							createModifierRef("baseSkillInitialValue", {
								skill: skill as BaseSkill,
								value,
							}),
						),
						...classConfigs[player.class].proficiencies,
					]);
				} else {
					props.setNext(id);
				}
			},
			id,
			text: props => {
				function ValueSelector(selectorProps: { title: string; prop: BaseSkill }) {
					const modifier = () => skillModifier(props.state.baseSkillValues[selectorProps.prop]) || 0;

					return (
						<div class="flex-1 p-3 rounded-box bg-base-300 flex flex-col gap-2">
							<span class="text-center font-bold">{selectorProps.title}</span>
							<input
								min={8}
								max={15}
								name={selectorProps.prop}
								value={props.state.baseSkillValues[selectorProps.prop]}
								onInput={e => props.setState("baseSkillValues", selectorProps.prop, e.currentTarget.valueAsNumber)}
								type="number"
								class="input w-full"
							/>
							<span class="text-center text-2xl">
								{modifier() >= 0 ? "+" : "-"}
								{Math.abs(modifier())}
							</span>
							{inRange(props.state.baseSkillValues[selectorProps.prop], 8, 16) ? (
								<span class="text-center text-sm opacity-75">
									uses {mapValuesToPoints(props.state.baseSkillValues[selectorProps.prop])} points
								</span>
							) : (
								<span class="text-center text-sm text-error">Must be between 8 and 15</span>
							)}
						</div>
					);
				}

				return (
					<>
						<h2>Tell me about yourself</h2>
						<div class="flex flex-col gap-5 p-2">
							<fieldset class="fieldset">
								<legend class="fieldset-legend">What's your name ?</legend>
								<input
									name="name"
									value={player.name}
									onInput={e => setPlayer("name", e.currentTarget.value)}
									class="input w-full input-bordered"
								/>
							</fieldset>
							<fieldset class="fieldset">
								<legend class="fieldset-legend">What's your class ?</legend>
								<select
									name="class"
									value={player.class}
									onChange={e => setPlayer("class", e.currentTarget.value as Class)}
									class="w-full input-bordered select"
								>
									{classes.map(clazz => (
										<option value={clazz} disabled={Object.keys(upgradesByClassByLevel[clazz]).length <= 0}>
											{getClassLabel(clazz)}
										</option>
									))}
								</select>
							</fieldset>
							<div class="flex gap-2 flex-wrap">
								<ValueSelector prop="strength" title="Strength" />
								<ValueSelector prop="dexterity" title="Dexterity" />
								<ValueSelector prop="constitution" title="Constitution" />
								<ValueSelector prop="intelligence" title="Intelligence" />
								<ValueSelector prop="wisdom" title="Wisdom" />
								<ValueSelector prop="charisma" title="Charisma" />
							</div>
						</div>
					</>
				);
			},
		};
	})!;
}
