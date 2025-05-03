import { A, Navigate } from "@solidjs/router";
import { createOpponents, formatOpponents } from "~/game/character/opponents";
import { usePlayerStore } from "~/contexts/player";
import { useFlags } from "~/contexts/flags";
import Layout from "~/components/Layout";
import { sum } from "lodash-es";
import { formatCp, gp, sp } from "~/utils/currency";
import { SetOptional } from "type-fest";

export type Challenge = { opponents: Parameters<typeof createOpponents>[0], reward: number }

const challenges: Array<SetOptional<Challenge, 'reward'>> = [
  { opponents: { bandit: 3, wolf: 2 } },
  { opponents: { bandit: 1 } },
  { opponents: { bandit: 2 } },
  { opponents: { bandit: 2, wolf: 1 } },
];

export default function ArenaPage() {
  const { getFlag } = useFlags();

  if (!getFlag("cutscene.arena")) {
    return <Navigate href="/dialog/arena" />;
  }

  const player = usePlayerStore();

  return (
    <Layout title="The Arena">
      <p class="text-xl">Welcome to the arena. Pick your fight.</p>

      <ol class="mt-auto menu menu-lg w-full bg-base-300 rounded-box gap-1">
        {challenges
          .map(challenge => ({ ...challenge, xp: sum(createOpponents(challenge.opponents).map(character => character.value.baseXP)) }))
          .sort((a, b) => a.xp - b.xp)
          .map(challenge => (
            <li>
              <A
                class={"p-3 flex"}
                href="/arena/fight"
                state={{ challenge }}
              >
                <div class="flex-1">{formatOpponents(challenge.opponents)}</div>
                <div class="badge badge-ghost">{challenge.xp} XP</div>
                <div class="badge badge-ghost">{formatCp(challenge.reward ?? sp(challenge.xp / 5), { style: 'short' })}</div>
              </A>
            </li>
          ))}
      </ol>
      <A
        class="btn btn-block btn-neutral border-0"
        href="/map"
      >
        Go back
      </A>
    </Layout>
  );
}
