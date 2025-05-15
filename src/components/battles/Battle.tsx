import { makePersisted } from "@solid-primitives/storage";
import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import Layout from "../Layout";
import { ActionCostIcon } from "./ActionCostIcon";
import { ActionTabs } from "./ActionTabs";
import { AttackDiceThrowModal } from "./AttackDiceThrowModal";
import { DefeatModal } from "./DefeatModal";
import { CharacterWithInitiative, Initiative } from "./Initiative";
import { Log, Logs } from "./Logs";
import { VictoryModal } from "./VictoryModal";
import { seconds } from "~/utils/promises";
import { getLocalStorageObject } from "~/utils/localStorage";
import { Opponent } from "~/game/character/opponents";
import {
	isActionFromRef,
	isPlayerCharacter,
	isSourced,
	isStorePlayerCharacter,
	isWeaponAttack,
	target,
} from "~/game/character/guards";
import { getAttacksPerAction, PlayerCharacter } from "~/game/character/character";
import {
	ActionFromRef,
	AnyAction,
	canHaveAction,
	executeAbility,
	executeAttack,
	useActionCost,
} from "~/game/character/actions";
import {
	ActionCost,
	actionCosts,
	AttackResult,
	Battle,
	Character,
	getTotalXPPerPartyMember,
	opponentAttackThrow,
	rollAllInitiatives,
	Store,
} from "~/game/battle/battle";

const inflictDamageProps = (amount: number) => ["hp", "current", (prev: number) => prev - amount] as const;

const BOOKMARK_BATTLE_KEY = "bookmarkedBattle";

export function BattleComponent(props: {
	battle: {
		party: Store<PlayerCharacter>[];
		opponents: Store<Opponent>[];
	};
	onBattleEnd?: (outcome: "victory" | "defeat") => void;
	forceXp?: number;
}) {
	const location = useLocation();

	// We changed battle, we start again
	if (getLocalStorageObject<{ key: string }>(BOOKMARK_BATTLE_KEY)?.key != location.pathname) {
		localStorage.removeItem(BOOKMARK_BATTLE_KEY);
	}

	const [bookmarkedState, setBookmarkedState] = makePersisted(
		createStore<{
			battle: Battle;
			initiatives: ReturnType<typeof rollAllInitiatives>;
			key: string;
			logs: Log[];
			turn: number;
		}>({
			battle: {
				opponents: props.battle.opponents.map(o => o.value),
				party: props.battle.party.map(p => p.value),
			},
			initiatives: rollAllInitiatives({
				opponents: props.battle.opponents.map(o => o.value),
				party: props.battle.party.map(p => p.value),
			}),
			key: location.pathname,
			logs: [],
			turn: 0,
		}),
		{ name: BOOKMARK_BATTLE_KEY },
	);

	const [turn, setTurn] = createSignal(bookmarkedState.turn);
	createEffect(() => setBookmarkedState("turn", turn()));
	const [logs, setLogs] = createSignal<Log[]>(bookmarkedState.logs);
	createEffect(() => setBookmarkedState("logs", logs()));
	const [battle, setBattle] = createStore<{
		party: PlayerCharacter[];
		opponents: Opponent[];
	}>(bookmarkedState.battle);

	const [selectedAction, setSelectedAction] = createSignal<((AnyAction | ActionFromRef) & { id: string }) | null>(null);
	const [diceThrowModal, setDiceThrowModal] = createSignal<AttackResult | null>(null);
	const [diceThrowModalCallback, setDiceThrowModalCallback] = createSignal<() => void>(() => {});
	const [defeatModalData, setDefeatModalData] = createSignal<(AttackResult & { success: true }) | null>(null);
	const [victoryModalData, setVictoryModalData] = createSignal<{
		attackResult: AttackResult & { success: true };
		xpGained: number;
	} | null>(null);
	const [preventPlayerAction, setPreventPlayerAction] = createSignal(false);
	const [computedExtraAttacks, setComputedExtraAttacks] = createSignal(false);

	const navigate = useNavigate();

	function getStoreFromBattle<K extends keyof Battle, T extends Battle[K][number]>(
		foundCharacterIndex: number,
		foundInArray: K,
	) {
		return {
			// @ts-expect-error @FIXME
			set: ((...args: any[]) => setBattle(foundInArray, foundCharacterIndex, ...(args as [any]))) as SetStoreFunction<T>,
			value: battle[foundInArray][foundCharacterIndex] as T,
		} as Store<T>;
	}

	function findInAllCharacter<T extends Opponent | PlayerCharacter = Opponent | PlayerCharacter>(
		predicate: (character: Opponent | PlayerCharacter) => boolean,
	): Store<T> {
		let foundCharacterIndex: number;
		let foundInArray: keyof Battle;

		foundCharacterIndex = battle.opponents.findIndex(predicate);
		if (foundCharacterIndex > -1) {
			foundInArray = "opponents";
		} else {
			foundCharacterIndex = battle.party.findIndex(predicate);
			if (foundCharacterIndex > -1) {
				foundInArray = "party";
			} else {
				throw new Error("character not found");
			}
		}

		return getStoreFromBattle(foundCharacterIndex, foundInArray);
	}

	const activeCharacterId = () => bookmarkedState.initiatives[turn() % bookmarkedState.initiatives.length].id;
	const activeCharacter = <T extends Character = Character>() => {
		const activeCharacter = findInAllCharacter(character => character.id == activeCharacterId());

		if (!activeCharacter.value) {
			throw new Error("No active character found, maybe the battle is just finished ?");
		}
		// @FIXME unsecure
		return activeCharacter as unknown as { value: T; set: SetStoreFunction<T> };
	};
	const canPlayerAct = () => bookmarkedState.initiatives[turn() % bookmarkedState.initiatives.length].type == "PARTY";

	const currentPlayerHaveAction = (costs: ActionCost[]) =>
		canHaveAction(activeCharacter<PlayerCharacter | Opponent>().value, costs);
	const usePlayerActionCost = (costs: ActionCost[]) =>
		useActionCost(activeCharacter<PlayerCharacter | Opponent>(), costs);

	const onCharacterClick = (character: CharacterWithInitiative) => {
		if (character.type == "PARTY" || !canPlayerAct() || !selectedAction()) return;

		const action = selectedAction()!;

		if (action.cost && !currentPlayerHaveAction([action.cost])) {
			return;
		}

		setPreventPlayerAction(true);

		if (isWeaponAttack(action) && isSourced(action)) {
			if (action.cost) {
				usePlayerActionCost([action.cost]);
			}

			// If the player just used this weapon action
			if (!computedExtraAttacks()) {
				const attacksPerTurn = getAttacksPerAction(activeCharacter());
				activeCharacter<PlayerCharacter>().set("availableExtraAttacks", attacksPerTurn - 1);
				setComputedExtraAttacks(true);
			} else {
				// @FIXME **maybe** this free action isn't the extra attack ?
				if (!action.cost) {
					activeCharacter<PlayerCharacter>().set("availableExtraAttacks", prev => prev - 1);
					// Since the extra attack will be removed, unselect it
					setSelectedAction(null);
				}
			}

			const opponent = findInAllCharacter<Opponent>(c => c.id == character.id);

			const result = executeAttack(target(action, opponent as Store<PlayerCharacter | Opponent>));

			setDiceThrowModal(result);
			setDiceThrowModalCallback(() => () => {
				if (result.success) {
					opponent.set(...inflictDamageProps(result.damage));
					if (opponent.value.hp.current <= 0) {
						setLogs(prev => [
							...prev,
							{
								message: `${activeCharacter().value.name} killed ${opponent.value.name} with ${result.damage}HP`,
								result,
								type: "PARTY",
							},
						]);
					} else {
						setLogs(prev => [
							...prev,
							{
								message: `${activeCharacter().value.name} attacked ${opponent.value.name} for ${result.damage}HP`,
								result,
								type: "PARTY",
							},
						]);
					}
				} else {
					setLogs(prev => [
						...prev,
						{
							message: `${activeCharacter().value.name} attacked ${opponent.value.name} but missed`,
							result,
							type: "PARTY",
						},
					]);
				}
			});
		} else if (isActionFromRef(action) && isSourced(action)) {
			if (action.cost) {
				usePlayerActionCost([action.cost]);
			}

			const opponent = findInAllCharacter<Opponent>(c => c.id == character.id);

			executeAbility(target(action, opponent as Store<PlayerCharacter | Opponent>));
		}

		setPreventPlayerAction(false);
	};

	onMount(() => {
		if (logs().length <= 0) {
			setLogs(
				bookmarkedState.initiatives.map(
					initiative =>
						({
							message: `${initiative.name} : ${initiative.initiative} for initiative.`,
							type: initiative.type,
						} satisfies Log),
				),
			);
		}
	});

	createEffect(function lockPlayerActionOnOpponentTurn() {
		setPreventPlayerAction(!canPlayerAct() || Boolean(defeatModalData()) || Boolean(victoryModalData()));
	});

	createEffect(async function opponentTurn() {
		if (canPlayerAct() || Boolean(defeatModalData()) || Boolean(victoryModalData())) return;

		if (activeCharacter().value.hp.current <= 0) {
			setTurn(p => p + 1);
			return;
		}

		await seconds(2);

		// @TODO add some targetting behavior
		const randomTarget = getStoreFromBattle(Math.floor(Math.random() * battle.party.length), "party");
		// @TODO add some attack logic
		const randomAttack = activeCharacter<Opponent>().value.attacks[0];

		if (!randomTarget || !randomAttack) {
			setLogs(prev => [
				...prev,
				{
					message: `${activeCharacter().value.name} does nothing...`,
					type: "OPPONENT",
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
					message: `${activeCharacter().value.name} attacked ${randomTarget.value.name} for ${result.damage}HP`,
					result,
					type: "OPPONENT",
				},
			]);
			randomTarget.set(...inflictDamageProps(result.damage));
		} else {
			setLogs(prev => [
				...prev,
				{
					message: `${activeCharacter().value.name} attacked ${randomTarget.value.name} but missed`,
					result,
					type: "OPPONENT",
				},
			]);
		}

		setTurn(prev => prev + 1);
	});

	createEffect(async function death() {
		if (battle.party.every(character => character.hp.current <= 0)) {
			const lastAttackResult = logs().findLast(log => log.type == "OPPONENT" && log.result?.success)?.result as
				| (AttackResult & { success: true })
				| undefined;

			if (!lastAttackResult) {
				return;
			}

			setPreventPlayerAction(true);

			await seconds(1);

			setDefeatModalData(lastAttackResult);
		}
	});

	createEffect(async function victory() {
		if (battle.opponents.every(character => character.hp.current <= 0)) {
			const lastAttackResult = logs().findLast(log => log.type == "PARTY" && log.result?.success)?.result as
				| (AttackResult & { success: true })
				| undefined;

			if (!lastAttackResult) {
				return;
			}

			setPreventPlayerAction(true);

			const totalXP = props.forceXp ?? getTotalXPPerPartyMember(battle);
			setVictoryModalData({
				attackResult: lastAttackResult,
				xpGained: totalXP,
			});
		}
	});

	onCleanup(() => {
		setBattle("party", { from: 0, to: battle.party.length - 1 }, "availableActions", [...actionCosts]);
		setBattle("party", { from: 0, to: battle.party.length - 1 }, "availableExtraAttacks", 0);
	});

	return (
		<Layout compact>
			<div class="h-full flex flex-col">
				<AttackDiceThrowModal
					onClose={() => {
						setDiceThrowModal(null);
						diceThrowModalCallback()();
						setDiceThrowModalCallback(() => () => {});
					}}
					values={diceThrowModal()}
				/>
				<DefeatModal
					onClose={() => {
						setTimeout(() => {
							localStorage.removeItem(BOOKMARK_BATTLE_KEY);
						}, 100);
						(props.onBattleEnd ?? (() => navigate("/town")))("defeat");
					}}
					fatalAttackResult={defeatModalData()}
				/>

				<VictoryModal
					onClose={() => {
						const totalXP = props.forceXp ?? getTotalXPPerPartyMember(battle);

						setBattle("party", { from: 0, to: battle.party.length - 1 }, "xp", "current", prev => prev + totalXP);

						setTimeout(() => {
							localStorage.removeItem(BOOKMARK_BATTLE_KEY);
						}, 100);

						localStorage.removeItem(BOOKMARK_BATTLE_KEY);
						(props.onBattleEnd ?? (() => navigate("/town")))("victory");
					}}
					fatalAttackResult={victoryModalData()?.attackResult}
					xpGained={victoryModalData()?.xpGained}
				/>

				<div class="mx-auto flex gap-5 m-3">
					{isStorePlayerCharacter(activeCharacter())
						? activeCharacter<PlayerCharacter>().value?.availableActions?.map(cost => (
								<ActionCostIcon actionCost={cost} available />
						  ))
						: actionCosts.map(cost => <ActionCostIcon actionCost={cost} available={false} />)}
				</div>

				<Logs logs={logs()} />

				<div class="w-full mt-auto flex flex-col">
					<button
						disabled={preventPlayerAction()}
						onClick={() => {
							if (isPlayerCharacter(activeCharacter<PlayerCharacter | Opponent>().value)) {
								activeCharacter<PlayerCharacter>().set("availableActions", [...actionCosts]);
								activeCharacter<PlayerCharacter>().set("availableExtraAttacks", 0);
							}
							setComputedExtraAttacks(false);
							setTurn(prev => prev + 1);
						}}
						class="btn btn-wide btn-primary mx-auto"
					>
						Next round
					</button>
					<div class="divider after:bg-base-400/20 before:bg-base-400/20 italic text-base-400 p-5">Battle order</div>
				</div>

				<Initiative
					canPartyAct={!preventPlayerAction()}
					currentPlayerHaveAction={currentPlayerHaveAction}
					findInAllCharacter={findInAllCharacter}
					initiatives={bookmarkedState.initiatives}
					onCharacterClick={onCharacterClick}
					selectedAction={selectedAction()}
					turn={turn()}
				/>

				<ActionTabs
					disabled={preventPlayerAction()}
					currentPlayer={getStoreFromBattle(0, "party")}
					currentPlayerHaveAction={currentPlayerHaveAction}
					selectedAction={selectedAction()}
					setSelectedAction={setSelectedAction}
					usePlayerAction={usePlayerActionCost}
				/>
			</div>
		</Layout>
	);
}
