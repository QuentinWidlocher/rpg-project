import { useLocation, useNavigate } from "@solidjs/router";
import { Challenge } from "./(arena)";
import { BattleComponent } from "~/components/battles/Battle";
import { usePlayerStore } from "~/contexts/player";
import { createOpponentStores } from "~/game/character/opponents";

export default function ArenaFight() {
	const player = usePlayerStore();
	const location = useLocation<{ challenge: Challenge }>();
	const navigate = useNavigate();

	if (!location.state?.challenge) {
		throw new Error("Arena fight must have a challenge");
	}

	const opponents = createOpponentStores(location.state.challenge.opponents, location.state.challenge.rename);
	return (
		<BattleComponent
			forceXp={location.state.challenge.xp}
			moneyGained={location.state?.challenge?.reward ?? 0}
			battle={{
				opponents,
				party: [player],
			}}
			onBattleEnd={{
				victory: () => navigate("/arena"),
			}}
		/>
	);
}
