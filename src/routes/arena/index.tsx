import { Navigate } from "@solidjs/router";
import { BattleComponent } from "~/components/battles/Battle";
import { createOpponents } from "~/game/character/opponents";
import { usePlayer } from "~/contexts/player";
import { useFlags } from "~/contexts/flags";

export default function ArenaPage() {
  const { getFlag } = useFlags()

  if (!getFlag('cutscene.arena')) {
    return <Navigate href="/dialog/arena" />
  }

  const { player, setPlayer } = usePlayer()

  const opponents = createOpponents({ rookieGladiator: 1 })

  return <BattleComponent battle={{
    opponents,
    party: [{ value: player, set: setPlayer }]
  }} />
}
