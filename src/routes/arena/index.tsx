import { Navigate } from "@solidjs/router";
import { BattleComponent } from "~/components/battles/Battle";
import { createOpponents } from "~/game/character/opponents";
import { usePlayerStore } from "~/contexts/player";
import { useFlags } from "~/contexts/flags";

export default function ArenaPage() {
  const { getFlag } = useFlags()

  if (!getFlag('cutscene.arena')) {
    return <Navigate href="/dialog/arena" />
  }

  const player = usePlayerStore()

  const opponents = createOpponents({ direWolf: 1 })

  return <BattleComponent battle={{
    opponents,
    party: [player]
  }} />
}
