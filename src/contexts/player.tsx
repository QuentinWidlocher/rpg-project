import { makePersisted } from "@solid-primitives/storage";
import { nanoid } from "nanoid";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { useModal } from "./modal";
import LevelUpModal, { UpgradesToDisplay } from "~/components/LevelUpModal";
import { Store, actionCosts } from "~/game/battle/battle";
import { createActionRef } from "~/game/character/actions";
import {
	BaseSkill,
	PlayerCharacter,
	Skill,
	baseSkills,
	getBaseSkill,
	getBaseSkillFromSkill,
	getMaxHp,
	getProficiencyBonus,
	getSkillLabel,
	isSkillProficient,
} from "~/game/character/character";
import { classes } from "~/game/character/classes/classes";
import { upgradesByClassByLevel } from "~/game/character/classes/upgrades";
import { createModifierRef, modifierUsedEventBus } from "~/game/character/modifiers";
import { d20, skillModifier } from "~/utils/dice";
import { createRequiredContextProvider } from "~/utils/useRequiredContextProvider";

export const nextLevelXPGap = {
	1: 0,
	2: 300,
	3: 900,
	4: 2700,
	5: 6500,
	6: 14000,
	7: 23000,
	8: 34000,
	9: 48000,
	10: 64000,
	11: 85000,
	12: 100000,
	13: 120000,
	14: 140000,
	15: 165000,
	16: 195000,
	17: 225000,
	18: 265000,
	19: 305000,
	20: 355000,
} satisfies Record<number, number>;

export const proficencyByLevel = {
	1: 2,
	2: 2,
	3: 2,
	4: 2,
	5: 3,
	6: 3,
	7: 3,
	8: 3,
	9: 4,
	10: 4,
	11: 4,
	12: 4,
	13: 5,
	14: 5,
	15: 5,
	16: 5,
	17: 6,
	18: 6,
	19: 6,
	20: 6,
} satisfies Record<number, number>;

export function getSkillModifiers(character: PlayerCharacter, skill: BaseSkill | Skill) {
	let stat;
	let proficiency = 0;

	if (baseSkills.includes(skill)) {
		stat = getBaseSkill(character, skill as BaseSkill);
	} else {
		stat = getBaseSkill(character, getBaseSkillFromSkill(skill as Skill));
		const hasProficiency = isSkillProficient(character, skill as Skill);
		proficiency = hasProficiency ? getProficiencyBonus(character) : 0;
	}

	const modifier = skillModifier(stat);

	return { modifier, proficiency };
}

export function skillCheck(character: PlayerCharacter, skill: BaseSkill | Skill, dd: number) {
	const { success } = detailedSkillCheck(character, skill, dd);
	return success;
}

export type DetailedSkillCheckResult = {
	roll: number;
	modifier: number;
	proficiency: number;
	success: boolean;
};

export function detailedSkillCheck(character: PlayerCharacter, skill: BaseSkill | Skill, dd: number) {
	const { modifier, proficiency } = getSkillModifiers(character, skill);

	const roll = d20(1);
	const result = Math.max(0, roll + modifier + proficiency);

	if (baseSkills.includes(skill)) {
		console.log(`${skill[0].toUpperCase()}${skill.slice(1)} skill check : ${result} / ${dd}`);
	} else {
		console.log(
			`${getSkillLabel(skill as Skill)} (${getBaseSkillFromSkill(skill as Skill)}) skill check : ${result} / ${dd}`,
		);
	}
	console.table([{ modifier, proficiency, roll }]);

	return {
		modifier,
		proficiency,
		roll,
		success: roll + modifier + proficiency >= dd,
	} satisfies DetailedSkillCheckResult;
}

export function getSkillTotalModifier(character: PlayerCharacter, skill: BaseSkill | Skill) {
	const { modifier, proficiency } = getSkillModifiers(character, skill);
	return modifier + proficiency;
}

export const [PlayerProvider, usePlayer] = createRequiredContextProvider(() => {
	const { open } = useModal();

	const [player, setPlayer] = makePersisted(
		createStore<PlayerCharacter>({
			actions: [],
			availableActions: [...actionCosts],
			availableExtraAttacks: 0,
			class: classes[0],
			hitDice: 1,
			hp: { current: 10 },
			id: nanoid(),
			inventory: [],
			level: 1,
			modifiers: [],
			money: 0,
			name: "",
			xp: { current: 0, next: nextLevelXPGap[2] },
		}),
		{ name: "player" },
	);

	createEffect(function levelUp() {
		if (player.xp.current >= player.xp.next) {
			const maxHpBefore = getMaxHp(player);
			const hpRatio = player.hp.current / maxHpBefore;
			setPlayer("level", prev => prev + 1);
			const maxHpAfter = getMaxHp(player);

			setPlayer("hp", "current", Math.round(maxHpAfter * hpRatio));
			setPlayer("xp", "next", nextLevelXPGap[(player.level + 1) as keyof typeof nextLevelXPGap] || Infinity);

			const upgrades: UpgradesToDisplay = {
				abilities: upgradesByClassByLevel[player.class]?.[player.level]?.abilities ?? [],
				modifiers: upgradesByClassByLevel[player.class]?.[player.level]?.modifiers ?? [],
			};

			open(() => (
				<LevelUpModal
					newUpgrades={upgrades}
					maxHp={{ after: maxHpAfter, before: maxHpBefore }}
					onClose={({ abilityProps, modifierProps }) => {
						let abilityIndex = 0;
						for (const ability of upgrades.abilities) {
							// use the default props, or the one returned by the form
							const props = "props" in ability ? ability.props : abilityProps[abilityIndex];
							if (!props) {
								// We should never pass here
								continue;
							}
							const newAbility = createActionRef(ability.abilityRefKey, props);
							if (player.actions.map(a => a.actionKey).includes(ability.abilityRefKey)) {
								// if the ability already exists, replace it
								setPlayer("actions", prev => [...prev.filter(a => a.actionKey != ability.abilityRefKey), newAbility]);
							} else {
								// if the ability does not already exists, add it
								setPlayer("actions", player.actions.length, newAbility);
							}
							abilityIndex++;
						}
						let modifierIndex = 0;
						for (const modifier of upgrades.modifiers) {
							// use the default props, or the one returned by the form
							const props = "props" in modifier ? modifier.props : modifierProps[modifierIndex];
							if (!props) {
								// We should never pass here
								continue;
							}
							const newModifier = createModifierRef(modifier.modifierRefKey, props);
							setPlayer("modifiers", player.modifiers.length, newModifier);
							modifierIndex++;
						}
					}}
				/>
			));
		}
	});

	modifierUsedEventBus.listen(usedMod => {
		if (player.modifiers.some(mod => mod.id == usedMod.id)) {
			if (usedMod.props.state.markedAsDone) {
				setPlayer("modifiers", prev => prev.filter(mod => mod.id != usedMod.id));
			}

			if (usedMod.modifierKey == "fightingStyleGreatWeaponFighting") {
				alert("You rolled a 1 and rerolled");
			}
		}
	});

	return { player, setPlayer };
});

export function usePlayerStore() {
	const { player, setPlayer } = usePlayer();

	return { set: setPlayer, value: player } satisfies Store<PlayerCharacter>;
}

export function pickBestSkill(
	character: PlayerCharacter,
	skill: (BaseSkill | Skill) | Array<BaseSkill | Skill>,
): BaseSkill | Skill {
	return Array.isArray(skill)
		? skill.reduce(
				({ name: bestSkillName, value: bestSkillValue }, currentSkillName) => {
					const value = getSkillTotalModifier(character, currentSkillName);
					return value > bestSkillValue ? { name: currentSkillName, value } : { name: bestSkillName, value: bestSkillValue };
				},
				{ name: skill[0], value: 0 } as { name: BaseSkill | Skill; value: number },
		  ).name
		: skill;
}
