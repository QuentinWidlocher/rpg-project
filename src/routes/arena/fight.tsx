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

  console.debug('location.state.challenge', location.state.challenge)
  const opponents = createOpponents(location.state.challenge.opponents)
  return (
    <BattleComponent
      battle={{
        opponents,
        party: [player],
      }}
      onBattleEnd={(outcome) => {
        if (outcome == 'victory') {
          player.set('money', prev => prev + (location.state?.challenge?.reward ?? 0))
        }

        navigate('/arena');
      }}
    />
  );
}
