import { useLocation, useNavigate } from "@solidjs/router";
import { Challenge } from "../arena/(arena)";
import { ForestProps, ForestStage } from "./(forest)";
import { BattleComponent } from "~/components/battles/Battle";
import { usePlayerStore } from "~/contexts/player";
import { getMoneyRewardForBattle } from "~/game/battle/battle";
import { computeDrops, monsterDrops } from "~/game/battle/monster-drops";
import { createModifierRef } from "~/game/character/modifiers";
import { createOpponentStores } from "~/game/character/opponents";

export type ForestFightProps = { challenge: Challenge; sneakAttack?: boolean; goBackToStage: ForestStage };

export default function ForestFight() {
	const player = usePlayerStore();
	const location = useLocation<ForestFightProps>();
	const navigate = useNavigate();

	if (!location.state?.challenge) {
		throw new Error("Forest fight must have a challenge");
	}

	const opponents = createOpponentStores(location.state.challenge.opponents, location.state.challenge.rename);

	if (location.state.sneakAttack) {
		for (const opponent of opponents) {
			opponent.set(
				"modifiers",
				opponent.value.modifiers.length,
				createModifierRef("overrideOpponentInitiative", { overrideWith: 0 }),
			);
		}
	}

	// Only get money if the monster does not have drop table
	const opponentsWithoutDrop = opponents.map(o => o.value).filter(o => !(o.key in monsterDrops));
	const moneyGained = opponentsWithoutDrop.length
		? getMoneyRewardForBattle({
				opponents: opponentsWithoutDrop,
				party: [player.value],
		  })
		: undefined;

	const items = opponents
		.map(o => {
			if (o.value.key in monsterDrops) {
				return computeDrops(player.value, o.value.key as keyof typeof monsterDrops);
			}
		})
		.filter(Boolean)
		.flat();

	return (
		<BattleComponent
			moneyGained={moneyGained}
			itemsGained={items}
			battle={{
				opponents: opponents,
				party: [player],
			}}
			onBattleEnd={{
				victory: () => {
					navigate("/forest", { state: { forceStage: location.state?.goBackToStage } satisfies ForestProps });
				},
			}}
		/>
	);
}
