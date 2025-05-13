import { A, Navigate } from "@solidjs/router";
import { sum } from "lodash-es";
import { SetOptional } from "type-fest";
import Layout from "~/components/Layout";
import { useDebug } from "~/contexts/debug";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { createOpponents, formatOpponents } from "~/game/character/opponents";
import { formatCc, sc } from "~/utils/currency";

export type Challenge = {
	opponents: Parameters<typeof createOpponents>[0];
	rename?: Parameters<typeof createOpponents>[1];
	reward: number;
	xp?: number;
};

const challenges: Array<SetOptional<Challenge, "reward">> = [
	{ opponents: { bandit: 3, wolf: 2 }, rename: { bandit: "Gladiator", wolf: "Hound" } },
	{ opponents: { bandit: 1 }, rename: { bandit: "Gladiator", wolf: "Hound" } },
	{ opponents: { bandit: 2 }, rename: { bandit: "Gladiator", wolf: "Hound" } },
	{ opponents: { bandit: 2, wolf: 1 }, rename: { bandit: "Gladiator", wolf: "Hound" } },
];

export default function ArenaPage() {
	const { getFlag } = useFlags();
	const { debug } = useDebug();

	if (!getFlag("cutscene.arena")) {
		return <Navigate href="/dialog/arena" />;
	}

	const { player } = usePlayer();

	const debugChallenges: Array<SetOptional<Challenge, "reward">> = [
		{ opponents: { debugXpBag: 1 }, xp: player.xp.next - player.xp.current },
	];

	return (
		<Layout title="The Arena" illustration={<img class="w-full h-full object-cover" src="/backgrounds/arena.webp" />}>
			<p class="text-xl">Welcome to the arena. Pick your fight.</p>

			<ol class="mt-auto menu menu-lg w-full bg-base-300 rounded-box gap-1">
				{[...challenges, ...(debug.showDebugChallenges ? debugChallenges : [])]
					.map(challenge => {
						const xp = challenge.xp ?? sum(createOpponents(challenge.opponents).map(character => character.value.baseXP));
						return {
							...challenge,
							reward: challenge.reward ?? sc(xp / 5),
							xp,
						};
					})
					.sort((a, b) => a.xp - b.xp)
					.map(challenge => (
						<li>
							<A class={"p-3 flex"} href="/arena/fight" state={{ challenge }}>
								<div class="flex-1">{formatOpponents(challenge.opponents, challenge.rename)}</div>
								<div class="badge badge-ghost">{challenge.xp} XP</div>
								<div class="badge badge-ghost">{formatCc(challenge.reward, { style: "short" })}</div>
							</A>
						</li>
					))}
			</ol>
			<A class="btn btn-block btn-neutral border-0" href="/town">
				Go back
			</A>
		</Layout>
	);
}
