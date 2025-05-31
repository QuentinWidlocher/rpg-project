import { BaseSkill, PlayerCharacter, Skill } from "../character/character";
import { OpponentTemplateName } from "../character/opponents";
import { BasicItemKey, ItemList } from "../items/items";
import { skillCheck } from "~/contexts/player";
import { ParsableDice, roll } from "~/utils/dice";

export type MonsterDrop = { itemKey: BasicItemKey; quantity: () => number } & (
	| { probability: ParsableDice }
	| { skillCheck: { skill: BaseSkill | Skill; dd: number } }
);

export type ComputedMonsterDrop = ItemList<BasicItemKey>;

export const monsterDrops = {
	boar: [
		{ itemKey: "boarTusk", quantity: () => 1, skillCheck: { dd: 5, skill: "nature" } },
		{ itemKey: "boarHide", quantity: () => 1, skillCheck: { dd: 10, skill: "nature" } },
	],
} satisfies Partial<Record<OpponentTemplateName, Array<MonsterDrop>>>;

export function computeDrops(character: PlayerCharacter, key: keyof typeof monsterDrops): ComputedMonsterDrop {
	const drops: Array<MonsterDrop> = monsterDrops[key];
	let validatedDrops = [];

	for (const drop of drops) {
		if ("skillCheck" in drop) {
			if (skillCheck(character, drop.skillCheck.skill, drop.skillCheck.dd)) {
				validatedDrops.push({ key: drop.itemKey, quantity: drop.quantity() });
			}
		} else {
			if (roll(drop.probability) == 1) {
				validatedDrops.push({ key: drop.itemKey, quantity: drop.quantity() });
			}
		}
	}

	return validatedDrops;
}
