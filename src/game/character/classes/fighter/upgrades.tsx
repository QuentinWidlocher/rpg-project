import { createAbilityByLevel } from "../../actions-helpers";
import { createModifierByLevel } from "../../modifiers";
import { abilityScoreImprovementUpgrade } from "../upgrade-list";
import { UpgradesByClassByLevel } from "../upgrades";

export const fighterUpgradesByLevel = {
	1: { abilities: [createAbilityByLevel("secondWind", { props: { maxUsage: 1 } })], modifiers: [] },
	2: { abilities: [createAbilityByLevel("actionSurge", { props: { maxUsage: 1 } })], modifiers: [] },
	3: { abilities: [], modifiers: [createModifierByLevel("bonusMaxHitDice", { props: { value: 1 } })] },
	4: {
		abilities: [],
		modifiers: [abilityScoreImprovementUpgrade],
	},
	5: {
		abilities: [],
		modifiers: [createModifierByLevel("extraAttack1", { props: {} })],
	},
	6: {
		abilities: [],
		modifiers: [abilityScoreImprovementUpgrade],
	},
	7: { abilities: [], modifiers: [createModifierByLevel("bonusMaxHitDice", { props: { value: 1 } })] },
	8: {
		abilities: [],
		modifiers: [abilityScoreImprovementUpgrade],
	},
	10: { abilities: [], modifiers: [createModifierByLevel("bonusMaxHitDice", { props: { value: 1 } })] },
	11: {
		abilities: [],
		modifiers: [createModifierByLevel("extraAttack2", { props: {} })],
	},
	12: {
		abilities: [],
		modifiers: [abilityScoreImprovementUpgrade],
	},
	14: {
		abilities: [],
		modifiers: [abilityScoreImprovementUpgrade],
	},
	15: { abilities: [], modifiers: [createModifierByLevel("bonusMaxHitDice", { props: { value: 1 } })] },
	16: {
		abilities: [],
		modifiers: [abilityScoreImprovementUpgrade],
	},
	17: {
		abilities: [
			createAbilityByLevel("actionSurge", { props: { maxUsage: 2 } }, "You can use Action Surge twice before a rest"),
		],
		modifiers: [],
	},
	18: { abilities: [], modifiers: [createModifierByLevel("bonusMaxHitDice", { props: { value: 1 } })] },
	19: {
		abilities: [],
		modifiers: [abilityScoreImprovementUpgrade],
	},
	20: {
		abilities: [],
		modifiers: [createModifierByLevel("extraAttack3", { props: {} })],
	},
} satisfies UpgradesByClassByLevel["fighter"];
