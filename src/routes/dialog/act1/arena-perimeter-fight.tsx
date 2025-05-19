import { useLocation, useNavigate } from "@solidjs/router";
import { BattleComponent } from "~/components/battles/Battle";
import { useFlags } from "~/contexts/flags";
import { usePlayerStore } from "~/contexts/player";
import { createModifierRef } from "~/game/character/modifiers";
import { createOpponentStores } from "~/game/character/opponents";

export type Act1FightState = {
	surpriseAttack?: boolean;
	criminalWasDisarmed?: boolean;
};

export default function Act1Fight() {
	const player = usePlayerStore();
	const location = useLocation<Act1FightState>();
	const { setFlag } = useFlags();
	const navigate = useNavigate();

	let opponents = createOpponentStores(
		{
			bandit: 1,
		},
		{ bandit: "Criminal" },
	);

	if (location.state?.surpriseAttack) {
		for (const opponent of opponents) {
			opponent.set(
				"modifiers",
				opponent.value.modifiers.length,
				createModifierRef("overrideOpponentInitiative", { overrideWith: 0 }),
			);
			// player.set("modifiers", player.value.modifiers.length, createModifierRef("advantageToHit", { maxUsage: 1 }));
		}
	}

	return (
		<BattleComponent
			battle={{
				opponents,
				party: [player],
			}}
			onBattleEnd={outcome => {
				setFlag("act1.defeatedTheCriminal");
				navigate("/town", { state: { victorious: outcome == "victory" } });
			}}
		/>
	);
}
