import { useLocation, useNavigate } from "@solidjs/router";
import { act0Opponent } from "./_config";
import { BattleComponent } from "~/components/battles/Battle";
import { usePlayerStore } from "~/contexts/player";
import { createModifierRef } from "~/game/character/modifiers";
import { createOpponents } from "~/game/character/opponents";

export default function Act0Fight() {
	const player = usePlayerStore();
	const location = useLocation<{ detected?: boolean; sneakAttack?: boolean }>();
	const navigate = useNavigate();

	let opponents = createOpponents({
		[act0Opponent]: 1,
	});

	if (location.state?.sneakAttack) {
		for (const opponent of opponents) {
			opponent.modifiers.push(createModifierRef("opponentDisadvantageToHit", { maxUsage: 1 }));
			opponent.modifiers.push(createModifierRef("overrideOpponentInitiative", { overrideWith: 0 }));
			player.set("modifiers", player.value.modifiers.length, createModifierRef("advantageToHit", { maxUsage: 1 }));
		}
	}

	return (
		<BattleComponent
			battle={{
				opponents,
				party: [player.value],
			}}
			onBattleEnd={outcome => navigate("../after-fight", { state: { victorious: outcome == "victory" } })}
		/>
	);
}
