import { useLocation, useNavigate } from "@solidjs/router";
import { Challenge } from "../arena/(arena)";
import { BattleComponent } from "~/components/battles/Battle";
import { usePlayerStore } from "~/contexts/player";
import { createOpponentStores } from "~/game/character/opponents";
import { createModifierRef } from "~/game/character/modifiers";

export type ForestFightProps = { challenge: Challenge; sneakAttack?: boolean };

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

	return (
		<BattleComponent
			battle={{
				opponents,
				party: [player],
			}}
			onBattleEnd={() => {
				navigate("/forest");
			}}
		/>
	);
}
