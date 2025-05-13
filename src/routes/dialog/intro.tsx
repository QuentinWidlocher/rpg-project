import { useNavigate } from "@solidjs/router";
import { sum } from "lodash-es";
import { AbilityDisplay } from "~/components/AbilityDisplay";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { IconoirPlus } from "~/components/icons/Plus";
import { Equipment } from "~/components/inventory/Equipment";
import { COUNTRY_NAME } from "~/constants";
import { useBookmark } from "~/contexts/bookmark";
import { useDebug } from "~/contexts/debug";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { ActionRefKey, actions, createActionRef } from "~/game/character/actions";
import { BaseSkill, Skill, getMaxHp, getSkillLabel } from "~/game/character/character";
import { Class, classConfigs, classes, getClassLabel } from "~/game/character/classes/classes";
import { fightingStyles } from "~/game/character/classes/fighter/modifiers";
import { upgradesByClassByLevel } from "~/game/character/classes/upgrades";
import { isWeaponItem } from "~/game/character/guards";
import { ModifierRef, createModifierRef } from "~/game/character/modifiers";
import { makeDialog } from "~/game/dialog/dialog";
import { ItemId, createItem, items } from "~/game/items/items";
import { skillModifier, stringifyDice } from "~/utils/dice";

export default function IntroDialog() {
	const navigate = useNavigate();
	const { debug } = useDebug();
	const { player, setPlayer } = usePlayer();
	const { getFlag, setFlag } = useFlags();
	const { clearBookmark } = useBookmark();

	if (getFlag("cutscene.intro")) {
		clearBookmark();
		navigate("/");
	}

	return (
		<DialogComponent<{
			baseSkillValues: Record<BaseSkill, number>;
			choices: any[][][]; // @FIXME
			equipment: (null | ItemId)[][];
			selectedFightingStyle: keyof typeof fightingStyles | null;
			selectedSkills: [Skill | null, Skill | null];
			selectedChoices: any[]; // @FIXME
			modifiers: ModifierRef[];
		}>
			key="characterCreation"
			hideStatusBar={!debug.enabled}
			initialState={{
				baseSkillValues: { charisma: 10, constitution: 10, dexterity: 10, intelligence: 10, strength: 10, wisdom: 10 },
				choices: new Array(classConfigs.fighter.startingEquipment.length)
					.fill(null)
					.map((_, i) =>
						new Array(classConfigs.fighter.startingEquipment[i].length)
							.fill(null)
							.map((_, j) => new Array(classConfigs.fighter.startingEquipment[i][j].length ?? 1)),
					),
				equipment: new Array(classConfigs.fighter.startingEquipment.length)
					.fill(null)
					.map((_, i) => new Array(classConfigs.fighter.startingEquipment[i].length).fill(null)),
				modifiers: [],
				selectedChoices: new Array(classConfigs.fighter.startingEquipment.length).fill(null),
				selectedFightingStyle: null,
				selectedSkills: [null, null],
			}}
			onDialogStop={() => {
				setFlag("cutscene.intro");
				navigate("/");
			}}
			dialog={makeDialog([
				{
					enterFunction: () => {
						setPlayer("inventory", []); // reset the inventory if the user refreshes the intro after chosing their weapons
						setPlayer("modifiers", []); // reset the inventory if the user refreshes the intro after chosing their weapons
					},
					text: (
						<>
							<h2 class="text-center">Welcome to the lands of {COUNTRY_NAME}</h2>
							<p>
								You will now create a character. Think about the kind of adventurer you want to play. You might be a courageous
								fighter, a skulking rogue, a fervent cleric, or a flamboyant wizard. Or you might be more interested in an
								unconventional character, such as a brave rogue who likes hand-to-hand combat, or a sharpshooter who picks off
								enemies from afar.
							</p>{" "}
							<br />
							<p>For now, you can only play a fighter with no associated species of background (but it's coming)</p>
						</>
					),
				},
				{
					exitFunction: props => {
						if (!player.name) {
							alert("You need to have a name.");
							props.setNext("character-infos");
							return;
						}

						if (sum(Object.values(props.state.baseSkillValues)) != 75) {
							alert("You need to set all your stats.");
							props.setNext("character-infos");
							return;
						}

						if (confirm("Are you sure ? You won't be able to change theses.")) {
							props.setState("modifiers", prev => [
								...prev,
								...Object.entries(props.state.baseSkillValues).map(([skill, value]) =>
									createModifierRef("baseSkillInitialValue", {
										skill: skill as BaseSkill,
										value,
									}),
								),
								...classConfigs[player.class].proficiencies,
								createModifierRef("equippedArmorsAC", {}),
								createModifierRef("equippedShieldAC", {}),
								createModifierRef("classHitPoints", {}),
								createModifierRef("baseAttacksPerAction", { value: 1 }),
								createModifierRef("baseMaxHitDice", {}),
							]);
						} else {
							props.setNext("character-infos");
						}
					},
					id: "character-infos",
					text: props => {
						function ValueSelector(selectorProps: { title: string; prop: BaseSkill }) {
							return (
								<div class="flex-1 p-3 rounded-box bg-base-300 flex flex-col gap-2">
									<span>{selectorProps.title}</span>
									<input
										min={10}
										max={20}
										type="number"
										class="input w-full"
										value={props.state.baseSkillValues[selectorProps.prop]}
										onInput={e => {
											props.setState("baseSkillValues", prev => ({
												...prev,
												[selectorProps.prop]: e.currentTarget.valueAsNumber,
											}));
										}}
									/>
									<span class="text-center">+{skillModifier(props.state.baseSkillValues[selectorProps.prop]) || 0}</span>
								</div>
							);
						}

						return (
							<>
								Tell me about yourself <br />
								<br />
								<div class="flex flex-col gap-5 p-2">
									<div>
										What's your name ? <br />
										<input
											class="input w-full input-bordered"
											value={player.name}
											onInput={e => setPlayer("name", e.currentTarget.value)}
										/>
									</div>
									<div>
										What's your class ? <br />
										<select
											class="w-full input-bordered select"
											value={player.class}
											onChange={e => setPlayer("class", e.currentTarget.value as Class)}
										>
											{classes.map(clazz => (
												<option value={clazz} disabled={clazz != "fighter"}>
													{getClassLabel(clazz)}
												</option>
											))}
										</select>
									</div>
									<span>
										You have {75 - sum(Object.values(props.state.baseSkillValues).map(x => x || 10))} points to allocate
									</span>
									<div class="flex gap-2 flex-wrap">
										<ValueSelector prop="strength" title="Strength" />
										<ValueSelector prop="dexterity" title="Dexterity" />
										<ValueSelector prop="constitution" title="Constitution" />
										<ValueSelector prop="intelligence" title="Intelligence" />
										<ValueSelector prop="wisdom" title="Wisdom" />
										<ValueSelector prop="charisma" title="Charisma" />
									</div>
								</div>
							</>
						);
					},
				},
				{
					exitFunction: props => {
						if (props.state.selectedSkills.filter(Boolean).length != 2) {
							alert("You must select two skills");
							props.setNext("skills");
						} else if (!props.state.selectedFightingStyle) {
							alert("You must select a fightingStyles");
							props.setNext("skills");
						}
						{
							props.setState("modifiers", prev => [
								...prev,
								createModifierRef("fighterProficiencies", {
									skills: [props.state.selectedSkills[0]!, props.state.selectedSkills[1]!],
								}),
								createModifierRef(props.state.selectedFightingStyle!, {}),
							]);
							setPlayer("modifiers", prev => [...prev, ...props.state.modifiers]);
						}
					},
					id: "skills",
					text: props => {
						return (
							<>
								<div class="flex flex-col gap-5 p-2">
									<label class="form-control">
										<span class="label">Choose two skill proficiencies</span>
										<div class="flex gap-5">
											<select
												class="w-full input-bordered select"
												value={props.state.selectedSkills[0] ?? undefined}
												onChange={e => props.setState("selectedSkills", prev => [e.currentTarget.value as Skill, prev[1]])}
											>
												{classConfigs[player.class].availableSkills.map(skill => (
													<option disabled={props.state.selectedSkills.includes(skill)} value={skill}>
														{getSkillLabel(skill)}
													</option>
												))}
											</select>
											<select
												class="w-full input-bordered select"
												value={props.state.selectedSkills[1] ?? undefined}
												onChange={e => props.setState("selectedSkills", prev => [prev[0], e.currentTarget.value as Skill])}
											>
												{classConfigs[player.class].availableSkills.map(skill => (
													<option disabled={props.state.selectedSkills.includes(skill)} value={skill}>
														{getSkillLabel(skill)}
													</option>
												))}
											</select>
										</div>
									</label>

									<label class="form-control">
										<span class="label">Choose a fighting style</span>
										<div class="join join-vertical">
											{(
												Object.entries(fightingStyles) as Array<
													[key: keyof typeof fightingStyles, (typeof fightingStyles)[keyof typeof fightingStyles]]
												>
											).map(([key, mod]) => (
												<div class="collapse join-item bg-base-100">
													<input
														type="radio"
														name="fightingStyle"
														checked={key == props.state.selectedFightingStyle}
														onChange={e => {
															if (e.currentTarget.checked) {
																props.setState("selectedFightingStyle", key);
															}
														}}
													/>
													<div class="collapse-title text-xl font-medium pr-3">
														<div class="flex justify-between items-center">
															<span>
																{mod.title} {key == props.state.selectedFightingStyle}{" "}
															</span>
															<input
																type="checkbox"
																class="checkbox checkbox-primary"
																checked={key == props.state.selectedFightingStyle}
															/>
														</div>
													</div>
													<div class="collapse-content">{typeof mod.description == "function" ? null : mod.description}</div>
												</div>
											))}
										</div>
									</label>
								</div>
							</>
						);
					},
				},
				{
					exitFunction: props => {
						if (props.state.equipment.flat().some(e => e == null)) {
							alert("You must select all available equipement");
							props.setNext("startingEquipment");
						} else {
							setPlayer("inventory", prev => [
								...prev,
								...props.state.equipment
									.flat()
									.filter(Boolean)
									.map(e => ({ ...createItem(items[e]), equipped: false })),
							]);
						}
					},
					id: "startingEquipment",
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
																				<option>Choose one</option>
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
																console.debug("itemId", itemId);
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
				},
				{
					id: "equipment",
					text: (
						<div class="not-prose">
							<h3 class="mb-5">Equip what you need</h3>
							<Equipment
								inventory={player.inventory}
								setInventory={(...args: any[]) => setPlayer("inventory", ...(args as [any]))}
							/>
						</div>
					),
				},
				{
					exitFunction: () => {
						for (const ability of upgradesByClassByLevel[player.class][player.level].abilities) {
							setPlayer(
								"actions",
								player.actions.length,
								createActionRef(ability.abilityRefKey, "props" in ability ? ability.props : {}),
							);
						}

						setPlayer("hp", "current", getMaxHp(player));
					},
					id: "actions",
					text: () => (
						<div class="not-prose">
							<h3 class="mb-5">Your {player.class} abilities :</h3>
							<ul>
								{Object.values(upgradesByClassByLevel[player.class][player.level].abilities).map(ability => {
									const action = actions[ability.abilityRefKey as ActionRefKey];

									return (
										<li>
											<AbilityDisplay ability={action} props={"props" in ability ? ability.props : ({} as any)} />
										</li>
									);
								})}
							</ul>
						</div>
					),
				},
				{
					text: "Well, time to begin your journey !",
				},
			])}
		/>
	);
}
