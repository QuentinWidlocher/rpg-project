import { useLocation, useNavigate } from "@solidjs/router";
import { Challenge } from "./(arena)";
import { usePlayerStore } from "~/contexts/player";
import { createOpponents } from "~/game/character/opponents";
import { BattleComponent } from "~/components/battles/Battle";

export default function ArenaFight() {
	const player = usePlayerStore();
	const location = useLocation<{ challenge: Challenge }>();
	const navigate = useNavigate();

	if (!location.state?.challenge) {
		throw new Error("Arena fight must have a challenge");
	}

	const opponents = createOpponents(location.state.challenge.opponents, location.state.challenge.rename);
	return (
		<BattleComponent
			forceXp={location.state.challenge.xp}
			battle={{
				opponents,
				party: [player.value],
			}}
			onBattleEnd={outcome => {
				if (outcome == "victory") {
					player.set("money", prev => prev + (location.state?.challenge?.reward ?? 0));
				}

				navigate("/arena");
			}}
		/>
	);
}
