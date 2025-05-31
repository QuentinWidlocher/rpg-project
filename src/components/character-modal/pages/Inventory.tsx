import { createSignal, Match, Switch } from "solid-js";
import { twJoin } from "tailwind-merge";
import { Equipment } from "~/components/inventory/Equipment";
import { usePlayer } from "~/contexts/player";
import { formatCc } from "~/utils/currency";

export default function InventoryPage() {
	const { player, setPlayer } = usePlayer();
	const [selectedTab, setSelectedTab] = createSignal<"equipment" | "items">("equipment");

	return (
		<>
			<div class="tabs tabs-lift w-full">
				<button
					class={twJoin("tab", selectedTab() == "equipment" && "tab-active")}
					onClick={() => setSelectedTab("equipment")}
				>
					Equipment
				</button>
				<button class={twJoin("tab", selectedTab() == "items" && "tab-active")} onClick={() => setSelectedTab("items")}>
					Items
				</button>

				<div class="tab-content block bg-base-100 border-base-300 p-6">
					<Switch>
						<Match when={selectedTab() == "equipment"}>
							<Equipment
								inventory={player.inventory.filter(item => item.type == "armor" || item.type == "weapon")}
								setInventory={(...args: any[]) => setPlayer("inventory", ...(args as [any]))}
							/>
						</Match>
						<Match when={selectedTab() == "items"}>
							<ul class="list">
								{player.inventory
									.filter(item => item.type == "basic")
									.map(item => (
										<li class="list-row">
											<span>{item.quantity}</span>
											<span>{item.name}</span>
											<span>{formatCc(item.value * item.quantity, { exhaustive: true, style: "short" })}</span>
										</li>
									))}
							</ul>
						</Match>
					</Switch>
				</div>
			</div>
		</>
	);
}
