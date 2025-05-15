import { SetStoreFunction } from "solid-js/store";
import { CharacterCreationState } from ".";
import { IconoirPlus } from "~/components/icons/Plus";
import { usePlayer } from "~/contexts/player";
import { PlayerCharacter } from "~/game/character/character";
import { classConfigs } from "~/game/character/classes/classes";
import { isWeaponItem } from "~/game/character/guards";
import { PartialScene } from "~/game/dialog/dialog";
import { createItem, ItemId, items } from "~/game/items/items";
import { stringifyDice } from "~/utils/dice";

const id = "startingEquipment";

export function startingEquipmentPage(pageProps: {
	setInventory: SetStoreFunction<Record<string, PlayerCharacter["inventory"]>>;
}): PartialScene<CharacterCreationState> {
	return {
		choices: [
			{ effect: props => props.setNext(-1), text: "Back" },
			{
				condition: props =>
					props.state.equipment.flat().some(e => e == null)
						? { success: false, tooltip: "You must select all available equipement" }
						: true,
				text: "Continue",
				visibleOnFail: true,
			},
		],
		exitFunction: props => {
			pageProps.setInventory(
				id,
				props.state.equipment
					.flat()
					.filter(Boolean)
					.map(e => ({ ...createItem(items[e]), equipped: false })),
			);
		},
		id,
		text: props => (
			<>
				<h3 class="mb-5">Choose your starting equipment</h3>
				<ul class="not-prose">
					{classConfigs.fighter.startingEquipment.map((choice, i) => (
						<>
							{i > 0 ? (
								<div class="divider divider-primary">
									<span class="text-primary text-lg">
										<IconoirPlus />
									</span>
								</div>
							) : null}
							<li>
								<ul class="flex flex-col gap-2">
									{choice.map((itemIds, j) => (
										<li class="form-control">
											<label class="btn w-full bg-base-300 justify-start flex-nowrap">
												<input
													class="radio radio-sm radio-primary -ml-1 mr-1"
													type="radio"
													name={`choice-${i}`}
													checked={props.state.selectedChoices[i] == j}
													onChange={() => {
														props.setState(
															"equipment",
															i,
															itemIds.map((itemId, k) => (Array.isArray(itemId) ? props.state.choices[i][j][k] : itemId)),
														);
														props.setState("selectedChoices", i, j);
													}}
												/>
												{itemIds.map((itemId, k) => (
													<>
														{k > 0 ? (
															<li>
																<IconoirPlus />
															</li>
														) : null}
														<li class={itemIds.every(id => Array.isArray(id)) ? "grow" : "shrink"}>
															{Array.isArray(itemId) ? (
																<select
																	class="select select-sm bg-base-100 dark:bg-base-200 select-primary w-full"
																	value={props.state.choices[i][j][k]}
																	onChange={e => {
																		if (props.state.selectedChoices[i] == j) {
																			props.setState("equipment", i, k, e.currentTarget.value as ItemId);
																		}
																		props.setState("choices", i, j, k, e.currentTarget.value as ItemId);
																	}}
																>
																	{itemId.map(id => (
																		<option value={id}>{items[id].name}</option>
																	))}
																</select>
															) : (
																items[itemId].name
															)}
														</li>
													</>
												))}
											</label>
											<ul class="flex gap-5">
												{props.state.choices[i][j].filter(Boolean).map((itemId: ItemId) => {
													const item = createItem(items[itemId]);

													if (isWeaponItem(item)) {
														return (
															<li class="mt-3 flex-1 bg-base-100 rounded-box p-3">
																<h3 class="text-center font-bold">{item.name}</h3>
																<div class="flex justify-center gap-3 w-full">
																	<div>{stringifyDice(item.hitDice)}</div>
																	<div>{item.rank}</div>
																	<div>{item.subType}</div>
																</div>
																<ul class="flex justify-center pl-0 w-full gap-2">
																	{item.tags.map(tag => (
																		<li class="badge badge-neutral">{tag}</li>
																	))}
																</ul>
															</li>
														);
													}
												})}
											</ul>
										</li>
									))}
								</ul>
							</li>
						</>
					))}
				</ul>
			</>
		),
	};
}
