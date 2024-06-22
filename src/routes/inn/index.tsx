import { useNavigate } from "@solidjs/router";
import { useFlags } from "~/contexts/flags";
import { Scene } from "~/game/dialog/dialog";

export const setDefaultInnDialogConfig = ((props) => {
  props.setIllustration({
    character: '/characters/innkeeper.webp',
    background: '/backgrounds/inn.png'
  })
}) satisfies Scene['enterFunction']

export default function Inn() {
  const navigate = useNavigate();
  const { getFlag } = useFlags();

  if (!getFlag('npc.inn.greeted')) {
    navigate('first-encounter')
  } else {
    navigate('second-encounter')
  }
}
