import { createEffect, createSignal, onCleanup } from "solid-js";
import Layout from "../Layout";
import { twJoin } from "tailwind-merge";
import { useNavigate } from "@solidjs/router";
import { PlayerCharacter, getAvailableWeaponsActions, getAvailableAbilitiesActions } from "~/game/character/character";
import {
	Battle,
	Character,
	getAllInitiatives,
	getTotalXPPerPartyMember,
	opponentAttackThrow,
	ActionCost,
	getMaxHp,
	Store,
	actionCosts,
	AttackResult,
} from "~/game/battle/battle";
import { SetStoreFunction } from "solid-js/store";
import { Opponent } from "~/game/character/opponents";
import { type Action, executeAttack, executeAbility, ActionFromRef } from "~/game/character/actions";
import {
	isAbility,
	isActionFromRef,
	isPlayerCharacter,
	isSourced,
	isStorePlayerCharacter,
	isWeaponAttack,
	source,
	target,
} from "~/game/character/guards";
import { intersection } from "lodash-es";
import { Action as ActionComponent } from "./Action";
import { Log, Logs } from "./Logs";
import { DiceThrow } from "./DiceThrow";
import { milliseconds, seconds } from "~/utils/promises";

const inflictDamageProps = (amount: number) => ["hp", "current", (prev: number) => prev - amount] as const;

export function BattleComponent(props: { battle: Battle }) {
	const initiatives = getAllInitiatives(props.battle);

	const [turn, setTurn] = createSignal(0);
	const [logs, setLogs] = createSignal<Log[]>([]);
	const [selectedAction, setSelectedAction] = createSignal<Action | ActionFromRef | null>(null);
	const [diceThrowModal, setDiceThrowModal] = createSignal<AttackResult | null>(null);

	const navigate = useNavigate();

	function findInAllCharacter<T extends Character = Opponent | PlayerCharacter>(
		predicate: (character: { value: Character }) => boolean,
	) {
		let foundCharacter;

		foundCharacter ??= props.battle.opponents.find(predicate);
		foundCharacter ??= props.battle.party.find(predicate);

		// @FIXME unsecure
		return foundCharacter as unknown as { value: T; set: SetStoreFunction<T> };
	}

	const charactersInOrder = () =>
		initiatives.map(initiative => ({
			...initiative,
			...findInAllCharacter(character => character.value.id == initiative.id)!.value,
		}));

	const round = () => Math.floor(turn() / initiatives.length);

	createEffect(() => console.debug("charactersInOrder", charactersInOrder()));

	const activeCharacterId = () => initiatives[turn() % initiatives.length].id;
	const activeCharacter = <T extends Character = Character>() => {
		const activeCharacter = findInAllCharacter(character => character.value.id == activeCharacterId());

		if (!activeCharacter.value) {
			throw new Error("No active character found, maybe the battle is just finished ?");
		}

		// @FIXME unsecure
		return activeCharacter as unknown as { value: T; set: SetStoreFunction<T> };
	};
	const canPlayerAct = () => initiatives[turn() % initiatives.length].type == "PARTY";
	const rotatedInitiative = () => {
		const copy = [...charactersInOrder().filter(character => character.hp.current > 0)];
		copy.push(...copy.splice(0, ((turn() % initiatives.length) + copy.length) % copy.length));
		return copy;
	};

	const currentPlayerHaveAction = (costs: ActionCost[]) => {
		const pc = activeCharacter<PlayerCharacter | Opponent>().value;
		if (isPlayerCharacter(pc)) {
			return intersection(pc.availableActions, costs).length > 0;
		} else {
			return false;
		}
	};

	const usePlayerAction = (costs: ActionCost[]) => {
		const pc = activeCharacter<PlayerCharacter | Opponent>();
		if (isStorePlayerCharacter(pc)) {
			pc.set("availableActions", prev => prev.filter(cost => !costs.includes(cost)));
		}
	};

	createEffect(async function opponentTurn() {
		if (canPlayerAct()) return;

		if (activeCharacter().value.hp.current <= 0) {
			setTurn(p => p + 1);
			return;
		}

    await seconds(2);

			// @TODO
			const randomTarget = props.battle.party[Math.floor(Math.random() * props.battle.party.length)];
			// @TODO
			const randomAttack = activeCharacter<Opponent>().value.attacks[0];

			if (!randomTarget || !randomAttack) {
				setLogs(prev => [
					...prev,
					{
						type: "OPPONENT",
						message: `${activeCharacter().value.name} does nothing...`,
					},
				]);

				setTurn(p => p + 1);
				return;
			}

			const result = opponentAttackThrow(activeCharacter<Opponent>().value, randomTarget.value, randomAttack);

			if (result.success) {
				setLogs(prev => [
					...prev,
					{
						type: "OPPONENT",
						message: `${activeCharacter().value.name} attacked ${randomTarget.value.name} for ${result.damage}HP`,
						result,
					},
				]);
				randomTarget.set(...inflictDamageProps(result.damage));
			} else {
				setLogs(prev => [
					...prev,
					{
						type: "OPPONENT",
						message: `${activeCharacter().value.name} attacked ${randomTarget.value.name} but missed`,
						result,
					},
				]);
			}

			setTurn(prev => prev + 1);
	});

	createEffect(async function death() {
		if (props.battle.party.every(character => character.value.hp.current <= 0)) {
		  await seconds(1)
			alert("You managed to escape before dying");

			for (const character of props.battle.party) {
				character.set("hp", "current", getMaxHp(character.value));
			}

			navigate("/map");
		}
	});

	createEffect(async function victory() {
		if (props.battle.opponents.every(character => character.value.hp.current <= 0)) {
      await seconds(2);

			const totalXP = getTotalXPPerPartyMember(props.battle);

			alert(`You win ! (${totalXP} XP)`);

			for (const character of props.battle.party) {
				character.set("xp", "current", prev => prev + totalXP);
				character.set("hp", "current", getMaxHp(character.value));
			}

			navigate("/map");
		}
	});

	onCleanup(() => {
		for (const store of props.battle.party) {
			store.set("availableActions", [...actionCosts]);
		}
	});

	return (
		<Layout compact>
			<div class="h-full flex flex-col">
				<DiceThrow onClose={() => setDiceThrowModal(null)} values={diceThrowModal()} />

				<Logs logs={logs()} />
				<div class="w-full mt-auto flex flex-col">
					<button
						disabled={!canPlayerAct()}
						onClick={() => {
							if (isPlayerCharacter(activeCharacter<PlayerCharacter | Opponent>().value)) {
								activeCharacter<PlayerCharacter>().set("availableActions", [...actionCosts]);
							}
							setTurn(prev => prev + 1);
						}}
						class="btn btn-wide btn-primary mx-auto"
					>
						Next round
					</button>
					<div class="divider after:bg-base-400/20 before:bg-base-400/20 italic text-base-400 p-5">Battle order</div>
				</div>

				<ul
					id="initiative"
					class="flex py-5 px-7 gap-10 overflow-visible overflow-x-auto w-full scrollbar scrollbar-track-transparent"
				>
					{[...new Array(2)].map((_, i) => (
						<>
							{(i == 0
								? rotatedInitiative().slice(0, initiatives.length - (turn() % initiatives.length))
								: charactersInOrder().filter(character => character.hp.current > 0)
							).map((character, j) => (
								<li
									aria-disabled={
										!canPlayerAct() ||
										!selectedAction() ||
										(selectedAction()?.cost && !currentPlayerHaveAction([selectedAction()!.cost!]))
									}
									aria-current={i == 0} // current round
									aria-selected={i == 0 && j == 0} // active character
									class="group shrink-0 radial-progress cursor-pointer aria-disabled:cursor-default text-base-400 hover:aria-disabled:text-base-300 aria-disabled:text-base-300 aria-selected:text-primary! before:-inset-4"
									style={{
										"--value": (character.hp.current / getMaxHp(findInAllCharacter(c => c.value.id == character.id).value)) * 100,
										"--thickness": "4px",
									}}
									role="progressbar"
									onClick={() => {
										if (character.type == "PARTY" || !canPlayerAct() || !selectedAction()) return;

										const action = selectedAction()!;

										if (action.cost && !currentPlayerHaveAction([action.cost])) {
											return;
										}

										if (isWeaponAttack(action) && isSourced(action)) {
											if (action.cost) {
												usePlayerAction([action.cost]);
											}

											const opponent = findInAllCharacter<Opponent>(c => c.value.id == character.id);

											const result = executeAttack(target(action, opponent as Store<PlayerCharacter | Opponent>));

											setDiceThrowModal(result);

											if (result.success) {
												opponent.set(...inflictDamageProps(result.damage));
												if (opponent.value.hp.current <= 0) {
													setLogs(prev => [
														...prev,
														{
															type: "PARTY",
															message: `${activeCharacter().value.name} killed ${opponent.value.name} with ${result.damage}HP`,
															result,
														},
													]);
												} else {
													setLogs(prev => [
														...prev,
														{
															type: "PARTY",
															message: `${activeCharacter().value.name} attacked ${opponent.value.name} for ${result.damage}HP`,
															result,
														},
													]);
												}
											} else {
												setLogs(prev => [
													...prev,
													{
														type: "PARTY",
														message: `${activeCharacter().value.name} attacked ${opponent.value.name} but missed`,
														result,
													},
												]);
											}
										} else if (isAbility(action) && isActionFromRef(action) && isSourced(action)) {
											// @TODO
											if (action.cost) {
												usePlayerAction([action.cost]);
											}

											const opponent = findInAllCharacter<Opponent>(c => c.value.id == character.id);

											const result = executeAbility(target(action, opponent as Store<PlayerCharacter | Opponent>));
										}
									}}
								>
									<div class="avatar avatar-placeholder">
										<div
											class={twJoin(
												"flex flex-col text-sm bg-base-400 group-aria-selected:bg-primary mask text-base-200 group-aria-selected:text-primary-content w-24 group-aria-disabled:bg-base-300 group-aria-disabled:text-base-400",
												character.type == "OPPONENT" ? "mask-circle" : "mask-hexagon",
											)}
										>
											<span class="text-center">{character.name}</span>
											<span>{`${character.hp.current}/${getMaxHp(
												findInAllCharacter(c => c.value.id == character.id).value,
											)}`}</span>
										</div>
									</div>
								</li>
							))}
							<div class="divider divider-horizontal text-base-400 -mx-3">{round() + 1 + i}</div>
						</>
					))}
					<li class="text-base-400 m-auto pr-5">...</li>
				</ul>

				<div role="tablist" class="tabs tabs-lift p-0">
					<input type="radio" name="actions" role="tab" class="tab flex-1" aria-label="Weapons" checked />
					<div role="tabpanel" class="tab-content bg-base-300 ">
						<div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
							{getAvailableWeaponsActions(props.battle.party[0]).map(action => (
								<ActionComponent
									action={action}
									available={currentPlayerHaveAction([action.cost])}
									onClick={() => setSelectedAction(action)}
									selected={action.title == selectedAction()?.title && selectedAction()?.cost == action.cost}
								/>
							))}
						</div>
					</div>

					<input type="radio" name="actions" role="tab" class="tab flex-1" aria-label="Abilities" />
					<div role="tabpanel" class="tab-content bg-base-300 ">
						<div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
							{getAvailableAbilitiesActions(props.battle.party[0]).map(action => (
								<ActionComponent
									action={action}
									available={
										(!action.cost || currentPlayerHaveAction([action.cost])) &&
										(!action.predicate || action.predicate(action.props, action.source, action.source))
									}
									onClick={() => {
										if (action.targetting == "self" && !action.multipleTargets) {
											executeAbility(target(action, action.source));
											if (action.cost) {
												usePlayerAction([action.cost]);
											}
										} else {
											setSelectedAction(action);
										}
									}}
									selected={action.title == selectedAction()?.title && selectedAction()?.cost == action.cost}
								/>
							))}
						</div>
					</div>

					<input type="radio" name="actions" role="tab" class="tab flex-1" aria-label="Other" />
					<div role="tabpanel" class="tab-content bg-base-300 ">
						<div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
							<div role="radio" onClick={() => navigate("/map")} class="btn">
								<span>Run</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
