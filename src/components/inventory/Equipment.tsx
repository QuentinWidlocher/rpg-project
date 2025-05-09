import { at } from "lodash-es";
import { batch, createEffect, on } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { PlayerCharacter } from "~/game/character/character";
import { Item } from "~/game/items/items";
import { stringifyDice } from "~/utils/dice";

const defaultUsedSlots = {
	armor: false,
	mainHand: false,
	offHand: false,
};

function getInventoryTitle(key: Item["type"]) {
	switch (key) {
		case "armor":
			return "Armors";
		case "weapon":
			return "Weapons";
	}
}

const longIntl = new Intl.ListFormat("en", {
	style: "long",
	type: "conjunction",
});
const shortIntl = new Intl.ListFormat("en", { style: "short", type: "unit" });

export function Equipment(props: {
	inventory: PlayerCharacter["inventory"];
	setInventory: SetStoreFunction<PlayerCharacter["inventory"]>;
}) {
	const [usedSlots, setUsedSlots] = createStore(defaultUsedSlots);

	function getSlotToUse(item: Item & { equipped?: boolean }): Array<keyof typeof defaultUsedSlots> {
		if (item.type == "armor") {
			if (item.subType == "shield") {
				return ["offHand"];
			} else {
				return ["armor"];
			}
		} else if (item.tags.includes("two-handed")) {
			return ["mainHand", "offHand"];
		} else {
			if (usedSlots.mainHand) {
				return ["offHand"];
			} else {
				return ["mainHand"];
			}
		}
	}

	const sortedInventory = () =>
		props.inventory.reduce(
			(acc, item, i) => ({
				...acc,
				[item.type]: [...(acc[item.type] ?? []), [item, i] as [Item, number]],
			}),
			{} as Record<Item["type"], Array<[item: Item, index: number]>>,
		);

	createEffect(
		on(
			() => props.inventory.map(i => i.equipped),
			() => {
				setUsedSlots(Object.keys(defaultUsedSlots) as (keyof typeof defaultUsedSlots)[], false);
				batch(() => {
					for (const item of props.inventory) {
						if (item.equipped) {
							setUsedSlots(getSlotToUse(item), true);
						}
					}
				});
			},
		),
	);

	return (
		<>
			<ul>
				{(Object.entries(sortedInventory()) as Array<[Item["type"], [Item, number][]]>).map(([type, items]) => (
					<li>
						<h4 class="mb-2 mt-5">{getInventoryTitle(type)}</h4>
						<ul class="space-y-2">
							{items.map(([item, i]) =>
								"equipped" in item ? (
									<li class="form-control">
										<label class="btn bg-base-100 justify-start">
											<input
												class="checkbox checkbox-primary mr-3 peer"
												type="checkbox"
												name={`item-${i}`}
												checked={props.inventory[i].equipped}
												disabled={!item.equipped && at(usedSlots, getSlotToUse(item)).some(Boolean)}
												onChange={e => {
													props.setInventory(i, "equipped", e.currentTarget.checked);
												}}
											/>
											<span class="peer-disabled:opacity-50">{item.name}</span>
											<span class="text-xs text-base-400 peer-disabled:opacity-50">
												{shortIntl.format(
													[
														"armorClass" in item ? `AC ${item.subType == "shield" ? "+" : ""} ${item.armorClass}` : null,
														"hitDice" in item ? stringifyDice(item.hitDice) : null,
														"tags" in item ? longIntl.format(item.tags) : null,
													].filter(Boolean),
												)}
											</span>
										</label>
									</li>
								) : null,
							)}
						</ul>
					</li>
				))}
			</ul>
		</>
	);
}
