import { A, createMemoryHistory, MemoryRouter, Navigate, Route, useLocation } from "@solidjs/router";
import { createSignal } from "solid-js";
import { twJoin } from "tailwind-merge";
import { GameIconsBugNet } from "../icons/BugNet";
import { GameIconsChest } from "../icons/Chest";
import { GameIconsExitDoor } from "../icons/ExitDoor";
import { GameIconsSkills } from "../icons/Skills";
import { GameIconsSleepingBag } from "../icons/SleepingBag";
import { GameIconsChecklist } from "../icons/Checklist";
import InventoryPage from "./pages/Inventory";
import StatsAndSkillsPage from "./pages/StatsAndSkills";
import { ShortRestModal } from "./ShortRestModal";
import { ModifiersAndAbilities } from "./pages/ModifiersAndAbilities";
import { usePlayer } from "~/contexts/player";
import { useModal } from "~/contexts/modal";
import Layout from "~/components/Layout";
import { useDebug } from "~/contexts/debug";

export function CharacterModal() {
	const { player } = usePlayer();
	const { close } = useModal();
	const { debug } = useDebug();
	const location = useLocation();
	const history = createMemoryHistory();
	const [url, setUrl] = createSignal(history.get());
	const [shortRestModalVisible, setShortRestModalVisible] = createSignal(false);

	history.listen(setUrl);

	return (
		<>
			<Layout compact hideStatusBar title={`${player.name}'s character sheet`}>
				<MemoryRouter
					history={history}
					root={props => (
						<div class="relative overflow-y-hidden flex flex-col flex-1">
							<div class="p-5 overflow-y-auto h-full flex-1">{props.children}</div>
							<div class="dock bg-neutral sticky bottom-0 dock-lg max-lg:rounded-b-none1">
								<button
									onClick={() => history.set({ value: "/stats" })}
									class={twJoin("text-neutral-content/40", url() == "/stats" && "text-neutral-content!")}
								>
									<GameIconsChecklist class="text-3xl" />
									<span class="dock-label">Stats</span>
								</button>

								<button
									onClick={() => history.set({ value: "/inventory" })}
									class={twJoin("text-neutral-content/40", url() == "/inventory" && "text-neutral-content!")}
								>
									<GameIconsChest class="text-3xl" />
									<span class="dock-label">Inventory</span>
								</button>

								<button
									onClick={() => history.set({ value: "/modifiers" })}
									class={twJoin("text-neutral-content/40", url() == "/modifiers" && "text-neutral-content!")}
								>
									<GameIconsSkills class="text-3xl" />
									<span class="dock-label">Features</span>
								</button>

								<button onClick={() => setShortRestModalVisible(true)} class="text-neutral-content/40">
									<GameIconsSleepingBag class="text-3xl" />
									<span class="dock-label">Short Rest</span>
								</button>

								{debug.enabled ? (
									<A href="/debug" class="text-neutral-content/40" state={{ backTo: location.pathname }} onClick={() => close()}>
										<GameIconsBugNet class="text-3xl" />
										<span class="dock-label">Debug</span>
									</A>
								) : null}

								<button class="text-neutral-content/40" onClick={() => close()}>
									<GameIconsExitDoor class="text-3xl" />
									<span class="dock-label">Close</span>
								</button>
							</div>
						</div>
					)}
				>
					<Route path="/" component={() => <Navigate href="/stats" />} />
					<Route path="/stats" component={StatsAndSkillsPage} />
					<Route path="/inventory" component={InventoryPage} />
					<Route path="/modifiers" component={ModifiersAndAbilities} />
				</MemoryRouter>
				<ShortRestModal
					onClose={() => {
						setShortRestModalVisible(false);
					}}
					visible={shortRestModalVisible()}
				/>
			</Layout>
		</>
	);
}
