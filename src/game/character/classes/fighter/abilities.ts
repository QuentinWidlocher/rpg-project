import { d10 } from "~/utils/dice";
import { createAbility } from "../../actions-helpers";
import { isPlayerCharacter, isSourced, isStorePlayerCharacter } from "../../guards";
import { getMaxHp } from "~/game/battle/battle";

export const fighterAbilities = {
	secondWind: createAbility<{}, {}>({
		title: "Second Wind",
		cost: "action",
		restoreOn: "any-rest",
		fn: (_props, source) => {
			if (isStorePlayerCharacter(source)) {
				source.set("hp", "current", prev => Math.min(prev + d10(1) + source.value.level, getMaxHp(source.value)));
			}
		},
		predicate: (_, source) => {
			const pc = source.value;
			return source.value.hp.current < getMaxHp(pc);
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
		targetting: "self",
		multipleTargets: false,
		description: `You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.`,
	}),
	actionSurge: createAbility<{}, {}>({
		title: "Action Surge",
		cost: undefined,
		restoreOn: "any-rest",
		fn: (_props, source) => {
			if (isStorePlayerCharacter(source)) {
				source.set("availableActions", prev => [...prev, "action"]);
			}
		},
		targetting: "self",
		description: `You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again.`,
		multipleTargets: false,
	}),
};
