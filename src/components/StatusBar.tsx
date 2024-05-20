import { IconoirUser } from "./icons/User"
import { useModal } from "~/contexts/modal"
import { CharacterModal } from "./CharacterModal"
import { twJoin } from "tailwind-merge"

export default function StatusBar(props: { transparent: boolean }) {
  const { open } = useModal()

  return <header class={twJoin("glass text-white shadow-md z-20 sm:rounded-t-xl flex justify-between px-2 ", props.transparent ? 'bg-primary/20' : 'bg-primary')}>
    <div id="left">
      <div class="tooltip tooltip-bottom" data-tip="Your Character">
        <button onClick={() => open(() => <CharacterModal />)} class="btn btn-circle btn-sm btn-ghost m-1 text-2xl" ><IconoirUser /></button>
      </div>
    </div>
    <div id="center"></div>
    <div id="right"></div>
  </header >
}
