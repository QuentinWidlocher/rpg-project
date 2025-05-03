import { useLocation, useNavigate } from "@solidjs/router";
import { usePlayerStore } from "~/contexts/player";
import { createOpponents } from "~/game/character/opponents";
import { Challenge } from "./(arena)";
import { BattleComponent } from "~/components/battles/Battle";

export default function ArenaFight() {
  const player = usePlayerStore();
  const location = useLocation<{ challenge: Challenge }>();
  const navigate = useNavigate();

  if (!location.state?.challenge) {
    navigate('/500')
    return
  }

  const opponents = createOpponents(location.state.challenge.opponents)
  console.debug('location.state.challenge.opponents', location.state.challenge.opponents)
  console.debug('opponents', opponents)
  return (
    <BattleComponent
      battle={{
        opponents,
        party: [player],
      }}
      onBattleEnd={() => {
        player.set('money', prev => prev + (location.state?.challenge?.reward ?? 0))
        navigate('/arena');
      }}
    />
  );
}
