import { createMemo } from "solid-js";
import { twJoin } from "tailwind-merge";
import { CharacterModal } from "./character-modal/CharacterModal";
import { IconoirUser } from "./icons/User";
// import { useDrawer } from "~/contexts/drawer";
import { IconoirCoins } from "./icons/Coins";
import { useModal } from "~/contexts/modal";
import { usePlayer } from "~/contexts/player";
import { getMaxHp } from "~/game/character/character";
import { formatCc } from "~/utils/currency";

export default function StatusBar(props: { transparent: boolean }) {
	const { open: openModal } = useModal();
	// const { open: openDrawer } = useDrawer();
	const { player } = usePlayer();

	const maxHp = createMemo(() => getMaxHp(player));

	return (
		<header
			class={twJoin(
				"glass text-white shadow-md z-20 sm:rounded-t-xl flex gap-5 justify-between items-center px-2 ",
				props.transparent ? "bg-neutral/25" : "bg-primary",
			)}
		>
			<div id="left">
				<div class="tooltip tooltip-bottom before:z-30" data-tip="Your Character">
					<button onClick={() => openModal(() => <CharacterModal />)} class="btn btn-circle btn-sm btn-ghost m-1 text-2xl">
						<IconoirUser />
					</button>
				</div>
			</div>
			<div id="center" class="w-1/2">
				<div class="tooltip tooltip-top after:opacity-0! w-full">
					<div class="tooltip-content" style="--tt-pos: 35px !important">
						{player.hp.current}/{maxHp()} HP
					</div>
					<progress
						class={twJoin("progress w-full", props.transparent ? "progress-secondary" : "text-white")}
						value={player.hp.current}
						max={maxHp()}
					></progress>
				</div>
			</div>
			<div id="right">
				{/* <button onClick={() => openDrawer(() => <span>from status bar</span>)}>drawer</button> */}
				<div class="flex mr-2 items-center gap-1">
					<IconoirCoins class="text-xl" /> <span>{formatCc(player.money, { style: "short" })}</span>
				</div>
			</div>
		</header>
	);
}
