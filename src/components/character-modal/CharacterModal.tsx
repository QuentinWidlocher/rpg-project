import { A, createMemoryHistory, MemoryRouter, Navigate, Route, useLocation } from "@solidjs/router";
import { createSignal } from "solid-js";
import { twJoin } from "tailwind-merge";
import { GameIconsBugNet } from "../icons/BugNet";
import { GameIconsChest } from "../icons/Chest";
import { GameIconsExitDoor } from "../icons/ExitDoor";
import { GameIconsSkills } from "../icons/Skills";
import InventoryPage from "./pages/Inventory";
import StatsAndSkillsPage from "./pages/StatsAndSkills";
import { usePlayer } from "~/contexts/player";
import { useModal } from "~/contexts/modal";
import Layout from "~/components/Layout";

export function CharacterModal() {
	const { player } = usePlayer();
	const { close } = useModal();
	const location = useLocation();
	const history = createMemoryHistory();
	const [url, setUrl] = createSignal(history.get());

	history.listen(setUrl);

	return (
		<MemoryRouter
			history={history}
			root={props => (
				<Layout compact hideStatusBar title={`${player.name}'s character sheet`}>
					<div class="relative overflow-y-hidden flex flex-col flex-1">
						<div class="p-5 overflow-y-auto h-full flex-1">{props.children}</div>
						<div class="dock bg-neutral sticky bottom-0 dock-lg">
							<button
								onClick={() => history.set({ value: "/stats" })}
								class={twJoin("text-neutral-content/75", url() == "/stats" && "text-primary")}
							>
								<GameIconsSkills class="text-3xl" />
								<span class="dock-label">Stats</span>
							</button>

							<button
								onClick={() => history.set({ value: "/inventory" })}
								class={twJoin("text-neutral-content/75", url() == "/inventory" && "text-primary")}
							>
								<GameIconsChest class="text-3xl" />
								<span class="dock-label">Inventory</span>
							</button>

							{import.meta.env.DEV ? (
								<A href="/debug" class="text-neutral-content/75" state={{ backTo: location.pathname }} onClick={() => close()}>
									<GameIconsBugNet class="text-3xl" />
									<span class="dock-label">Debug</span>
								</A>
							) : null}

							<button class="text-neutral-content/75" onClick={() => close()}>
								<GameIconsExitDoor class="text-3xl" />
								<span class="dock-label">Close</span>
							</button>
						</div>
					</div>
				</Layout>
			)}
		>
			<Route path="/" component={() => <Navigate href="/stats" />} />
			<Route path="/stats" component={StatsAndSkillsPage} />
			<Route path="/inventory" component={InventoryPage} />
		</MemoryRouter>
	);
}
