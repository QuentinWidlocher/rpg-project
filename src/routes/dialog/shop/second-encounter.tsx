import { useNavigate } from "@solidjs/router";
import { setDefaultShopDialogConfig, shopkeeperInfos } from ".";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { makeDialog } from "~/game/dialog/dialog";
import { armors } from "~/game/items/armors";
import { createArmor, createWeapon } from "~/game/items/items";
import { weapons } from "~/game/items/weapons";
import { formatCc, gc, sc } from "~/utils/currency";
import { stringifyDice } from "~/utils/dice";

export default function ShopSecondEncounterDialog() {
	const navigate = useNavigate();
	const { getFlag } = useFlags();
	const { player, setPlayer } = usePlayer();

	return (
		<DialogComponent<{ spentCc: number }>
			key="shopKeeper.second-encounter"
			initialState={{ spentCc: 0 }}
			setupFunction={setDefaultShopDialogConfig}
			dialog={makeDialog([
				{
					choices: [
						{ effect: props => props.setNext("buy-weapons"), text: "Buy weapons" },
						{ effect: props => props.setNext("buy-armors"), text: "Buy armors" },
						{ effect: props => props.setNext("exit"), text: "Exit the shop" },
					],
					id: "start",
					text: () => (
						<>
							<blockquote>
								Hi again !<br />
								What can I do for you today ?
							</blockquote>
							<pre>The shop is under developpement, you can buy everything for now</pre>
						</>
					),
					title: () => (getFlag("npc.shopkeeper.gotName") ? shopkeeperInfos.firstName : "Shopkeeper"),
				},
				{
					choices: [
						{ effect: props => props.setNext("start"), text: "Go back" },
						{ effect: props => props.setNext("exit"), text: "Exit the shop" },
					],
					id: "buy-armors",
					text: props => (
						<div>
							<h2 class="mt-0">Armors</h2>
							<ul class="pl-0">
								{Object.values(armors).map(armor => (
									<li tabindex="0" class="collapse collapse-arrow bg-base-100 border-base-300 border">
										<input type="radio" name="weapons" />
										<div class="collapse-title flex justify-between">
											<span>{armor.name}</span>
											<span>{formatCc(armor.value)}</span>
										</div>
										<div class="collapse-content space-y-5">
											<div>
												AC: {armor.subType == "shield" ? "+" : ""}
												{armor.armorClass}
											</div>
											<div>Type: {armor.subType}</div>
											<button
												class="btn btn-block"
												disabled={player.money < armor.value}
												onClick={() => {
													setPlayer("inventory", player.inventory.length, createArmor(armor));
													setPlayer("money", prev => prev - armor.value);
													props.setState("spentCc", prev => prev + armor.value);
												}}
											>
												Buy one ({formatCc(armor.value, { exhaustive: true, style: "short" })})
											</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					),
				},
				{
					choices: [
						{ effect: props => props.setNext("start"), text: "Go back" },
						{ effect: props => props.setNext("exit"), text: "Exit the shop" },
					],
					id: "buy-weapons",
					text: props => (
						<div>
							<h2 class="mt-0">Weapons</h2>
							<ul class="pl-0">
								{Object.values(weapons).map(weapon => (
									<li tabindex="0" class="collapse collapse-arrow bg-base-100 border-base-300 border">
										<input type="radio" name="weapons" />
										<div class="collapse-title flex justify-between">
											<span>{weapon.name}</span>
											<span>{formatCc(weapon.value)}</span>
										</div>
										<div class="collapse-content space-y-5">
											<div class="flex justify-around w-full">
												<div>{stringifyDice(weapon.hitDice)}</div>
												<div>{weapon.rank}</div>
												<div>{weapon.subType}</div>
											</div>
											<ul class="flex justify-center pl-0 w-full gap-2">
												{weapon.tags.map(tag => (
													<li class="badge badge-neutral">{tag}</li>
												))}
											</ul>
											<button
												class="btn btn-block"
												disabled={player.money < weapon.value}
												onClick={() => {
													setPlayer("inventory", player.inventory.length, createWeapon(weapon));
													setPlayer("money", prev => prev - weapon.value);
													props.setState("spentCc", prev => prev + weapon.value);
												}}
											>
												Buy one ({formatCc(weapon.value, { exhaustive: true, style: "short" })})
											</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					),
				},
				{
					id: "exit",
					text: props => (
						<blockquote>
							{props.state.spentCc > 0
								? props.state.spentCc > sc(5)
									? props.state.spentCc > gc(5)
										? props.state.spentCc > gc(20)
											? "Thanks a lot ! You're welcome back here anytime, don't be a stranger."
											: "Thank you for your support, have a nice day !"
										: "Thank you, be safe out there okay!"
									: "Thanks, see you soon."
								: "Just looking eh ? Alright take care."}
						</blockquote>
					),
				},
			])}
			onDialogStop={() => navigate("/town")}
		/>
	);
}
