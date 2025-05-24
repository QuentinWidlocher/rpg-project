import { useLocation, useNavigate } from "@solidjs/router";
import { Challenge } from "../arena/(arena)";
import { ForestProps, ForestStage } from "./(forest)";
import { BattleComponent } from "~/components/battles/Battle";
import { usePlayerStore } from "~/contexts/player";
import { createOpponentStores } from "~/game/character/opponents";
import { createModifierRef } from "~/game/character/modifiers";
import { getMoneyRewardForCR } from "~/game/battle/rewards";
import { getMoneyRewardForBattle } from "~/game/battle/battle";

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

	const moneyGained = getMoneyRewardForBattle({ opponents: opponents.map(o => o.value), party: [player.value] });

	console.debug("moneyGained", moneyGained);

	return (
		<BattleComponent
			moneyGained={moneyGained}
			battle={{
				opponents,
				party: [player],
			}}
			onBattleEnd={() => {
				navigate("/forest", { state: { forceStage: location.state?.goBackToStage } satisfies ForestProps });
			}}
		/>
	);
}
