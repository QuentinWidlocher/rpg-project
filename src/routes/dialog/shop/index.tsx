import { useNavigate } from "@solidjs/router"
import { useFlags } from "~/contexts/flags";
import { Scene } from "~/game/dialog/dialog";

export const shopkeeperInfos = {
  firstName: 'Naerria',
  lastName: 'Thornbeef'
} as const

export const setDefaultShopDialogConfig = ((props) => {
  props.setIllustration({
    character: '/characters/shopkeeper.webp',
    background: '/backgrounds/shop.png'
  })
}) satisfies Scene['enterFunction']

export default function ShopDialogs() {
  const navigate = useNavigate();
  const { getFlag } = useFlags();

  if (!getFlag('npc.shopkeeper.greeted')) {
    console.debug('first-encounter');
    navigate('first-encounter')
  } else {
    navigate('second-encounter')
  }

}
