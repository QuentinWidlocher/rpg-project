import { IconoirUser } from "./icons/User";
import { useModal } from "~/contexts/modal";
import { CharacterModal } from "./CharacterModal";
import { twJoin } from "tailwind-merge";
import { usePlayer } from "~/contexts/player";
import { getMaxHp } from "~/game/character/character";
import { IconoirCoins } from "./icons/Coins";
import { createMemo } from "solid-js";
import { formatCp } from "~/utils/currency";

export default function StatusBar(props: { transparent: boolean }) {
	const { open } = useModal();
	const { player } = usePlayer();

	const maxHp = createMemo(() => getMaxHp(player));

	return (
		<header
			class={twJoin(
				"glass text-white shadow-md z-20 sm:rounded-t-xl flex gap-5 justify-between items-center px-2 ",
				props.transparent ? "" : "bg-primary",
			)}
		>
			<div id="left">
				<div class="tooltip tooltip-bottom before:z-30" data-tip="Your Character">
					<button onClick={() => open(() => <CharacterModal />)} class="btn btn-circle btn-sm btn-ghost m-1 text-2xl">
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
				<div class="flex mr-2 items-center gap-1">
					<IconoirCoins class="text-xl" /> <span>{formatCp(player.money, { style: "short" })}</span>
				</div>
			</div>
		</header>
	);
}
