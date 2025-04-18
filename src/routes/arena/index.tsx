import { Navigate } from "@solidjs/router";
import { BattleComponent } from "~/components/battles/Battle";
import { createOpponents } from "~/game/character/opponents";
import { usePlayerStore } from "~/contexts/player";
import { useFlags } from "~/contexts/flags";
import { createModifierRef } from "~/game/character/modifiers";

const challenges = {
	1: { bandit: 1 },
	3: { bandit: 2 },
	5: { bandit: 2, wolf: 1 },
} satisfies Record<number, Parameters<typeof createOpponents>[0]>;

export default function ArenaPage() {
	const { getFlag } = useFlags();

	if (!getFlag("cutscene.arena")) {
		return <Navigate href="/dialog/arena" />;
	}

	const player = usePlayerStore();

	let selectedChallenge = challenges[1];
	for (const [level, challenge] of Object.entries(challenges)) {
		if (Number(level) <= player.value.level) {
			selectedChallenge = challenge;
		} else {
			break;
		}
	}

	const opponents = createOpponents(selectedChallenge);

	return (
		<BattleComponent
			battle={{
				opponents,
				party: [player],
			}}
		/>
	);
}
