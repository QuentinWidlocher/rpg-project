import { makePersisted } from "@solid-primitives/storage";
import { nanoid } from "nanoid";
import { ParentProps, createContext, createEffect, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { Store, actionCosts } from "~/game/battle/battle";
import {
	BaseSkill,
	PlayerCharacter,
	Skill,
	baseSkills,
	getBaseSkill,
	getBaseSkillFromSkill,
	getProficiencyBonus,
	getSkillLabel,
	isSkillProficient,
	skills,
} from "~/game/character/character";
import { classes } from "~/game/character/classes/classes";
import { modifierUsedEventBus } from "~/game/character/modifiers";
import { d20, skillModifier } from "~/utils/dice";

export const nextLevelXPGap = {
	1: 0,
	2: 300,
	3: 900,
	4: 2700,
	5: 6500,
} satisfies Record<number, number>;

export const proficencyByLevel = {
	1: 2,
	2: 2,
	3: 2,
	4: 2,
	5: 3,
} satisfies Record<number, number>;

export function getSkillModifiers(character: PlayerCharacter, skill: BaseSkill | Skill) {
	let stat = 0;
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
	console.table([{ roll, modifier, proficiency }]);

	return {
		roll,
		modifier,
		proficiency,
		success: roll + modifier + proficiency >= dd,
	} satisfies DetailedSkillCheckResult;
}

export function getSkillTotalModifier(character: PlayerCharacter, skill: BaseSkill | Skill) {
	const { modifier, proficiency } = getSkillModifiers(character, skill);
	return modifier + proficiency;
}

export type PlayerContext = {
	player: PlayerCharacter;
	setPlayer: SetStoreFunction<PlayerCharacter>;
};

export const PlayerContext = createContext<PlayerContext>();

export function PlayerProvider(props: ParentProps) {
	const [player, setPlayer] = makePersisted(
		createStore<PlayerCharacter>({
			id: nanoid(),
			name: "",
			level: 1,
			xp: { current: 0, next: nextLevelXPGap[2] },
			hp: { current: 10 },
			inventory: [],
			class: classes[0],
			modifiers: [],
			actions: [],
			money: 0,
			availableActions: [...actionCosts],
		}),
		{ name: "player" },
	);

	createEffect(function levelUp() {
		if (player.xp.current >= player.xp.next) {
			setPlayer("level", prev => prev + 1);
			setPlayer("xp", "next", nextLevelXPGap[Math.min(player.level, 5) as keyof typeof nextLevelXPGap]);

			alert(`You're now level ${player.level} !`);
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

	return (
		<PlayerContext.Provider value={{ player, setPlayer }}>
			<div id="player">{props.children}</div>
		</PlayerContext.Provider>
	);
}

export function usePlayer() {
	const context = useContext(PlayerContext);

	if (context == null) {
		throw new Error("You must use `usePlayer` inside a `<PlayerProvider/>`");
	}

	return context;
}

export function usePlayerStore() {
	const { player, setPlayer } = usePlayer();

	return { value: player, set: setPlayer } satisfies Store<PlayerCharacter>;
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
