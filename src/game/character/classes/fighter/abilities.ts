import { EmptyObject } from "type-fest";
import { createAbility } from "../../actions-helpers";
import { isPlayerCharacter, isSourced, isStorePlayerCharacter } from "../../guards";
import { getModifierValue } from "../../modifiers";
import { getMaxHp } from "~/game/battle/battle";
import { d10 } from "~/utils/dice";

export const fighterAbilities = {
	actionSurge: createAbility<EmptyObject, EmptyObject>({
		cost: undefined,
		description: `You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again.`,
		fn: (_props, source) => {
			if (isStorePlayerCharacter(source)) {
				source.set("availableActions", prev => [...prev, "action"]);
				// We add as much extra attack as our max
				source.set(
					"availableExtraAttacks",
					prev => prev + getModifierValue(source.value.modifiers, "attackPerAction", 1)(source.value) - 1,
				);
			}
		},
		multipleTargets: false,
		restoreOn: "any-rest",
		targetting: "self",
		title: "Action Surge",
	}),
	secondWind: createAbility<EmptyObject, EmptyObject>({
		cost: "action",
		description: `You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.`,
		fn: (_props, source) => {
			if (isStorePlayerCharacter(source)) {
				source.set("hp", "current", prev => Math.min(prev + d10(1) + source.value.level, getMaxHp(source.value)));
			}
		},
		label: action => {
			if (isSourced(action)) {
				const pc = action.source.value;
				if (isPlayerCharacter(pc)) {
					return `+ 1d10 + ${pc.level} HP`;
				}
			}

			return `+ 1d10 HP`;
		},
		multipleTargets: false,
		predicate: (_, source) => {
			const pc = source.value;
			return source.value.hp.current < getMaxHp(pc);
		},
		restoreOn: "any-rest",
		targetting: "self",
		title: "Second Wind",
	}),
};
