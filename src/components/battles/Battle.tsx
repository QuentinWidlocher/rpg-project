import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import {
  ActionCost,
  actionCosts,
  AttackResult,
  Battle,
  Character,
  getAllInitiatives,
  getMaxHp,
  getTotalXPPerPartyMember,
  opponentAttackThrow,
  Store,
} from "~/game/battle/battle";
import { type Action, ActionFromRef, canHaveAction, executeAbility, executeAttack, useActionCost } from "~/game/character/actions";
import { PlayerCharacter } from "~/game/character/character";
import {
  isAbility,
  isActionFromRef,
  isPlayerCharacter,
  isSourced,
  isWeaponAttack,
  target
} from "~/game/character/guards";
import { Opponent } from "~/game/character/opponents";
import { seconds } from "~/utils/promises";
import Layout from "../Layout";
import { ActionTabs } from "./ActionTabs";
import { AttackDiceThrowModal } from "./AttackDiceThrowModal";
import { CharacterWithInitiative, Initiative } from "./Initiative";
import { Log, Logs } from "./Logs";
import { DefeatModal } from "./DefeatModal";
import { VictoryModal } from "./VictoryModal";

const inflictDamageProps = (amount: number) => ["hp", "current", (prev: number) => prev - amount] as const;

export function BattleComponent(props: {
  battle: Battle,
  onBattleEnd?: (outcome: 'victory' | 'defeat') => void
}) {
  const initiatives = getAllInitiatives(props.battle);

  const [turn, setTurn] = createSignal(0);
  const [logs, setLogs] = createSignal<Log[]>([]);
  const [selectedAction, setSelectedAction] = createSignal<Action | ActionFromRef | null>(null);
  const [diceThrowModal, setDiceThrowModal] = createSignal<AttackResult | null>(null);
  const [diceThrowModalCallback, setDiceThrowModalCallback] = createSignal<() => void>(() => { });
  const [defeatModalData, setDefeatModalData] = createSignal<(AttackResult & { success: true }) | null>(null);
  const [victoryModalData, setVictoryModalData] = createSignal<({ attackResult: AttackResult & { success: true }, xpGained: number }) | null>(null);
  const [preventPlayerAction, setPreventPlayerAction] = createSignal(false)

  const navigate = useNavigate();

  function findInAllCharacter<T extends Character = Opponent | PlayerCharacter>(
    predicate: (character: { value: Character }) => boolean,
  ): Store<T> {
    let foundCharacter: Store<Opponent> | Store<PlayerCharacter> | undefined;

    foundCharacter ??= props.battle.opponents.find(predicate);
    foundCharacter ??= props.battle.party.find(predicate);

    if (!foundCharacter) {
      throw new Error('character not found')
    }

    // @FIXME unsecure
    return foundCharacter as any;
  }

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

  const currentPlayerHaveAction = (costs: ActionCost[]) => canHaveAction(activeCharacter<PlayerCharacter | Opponent>().value, costs);
  const usePlayerActionCost = (costs: ActionCost[]) => useActionCost(activeCharacter<PlayerCharacter | Opponent>(), costs);

  const onCharacterClick = (character: CharacterWithInitiative) => {
    if (character.type == "PARTY" || !canPlayerAct() || !selectedAction()) return;

    const action = selectedAction()!;

    if (action.cost && !currentPlayerHaveAction([action.cost])) {
      return;
    }

    setPreventPlayerAction(true)

    if (isWeaponAttack(action) && isSourced(action)) {
      if (action.cost) {
        usePlayerActionCost([action.cost]);
      }

      const opponent = findInAllCharacter<Opponent>(c => c.value.id == character.id);

      const result = executeAttack(target(action, opponent as Store<PlayerCharacter | Opponent>));

      setDiceThrowModal(result);
      setDiceThrowModalCallback(() => () => {
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
      })
    } else if (isActionFromRef(action) && isSourced(action)) {
      if (action.cost) {
        usePlayerActionCost([action.cost]);
      }

      const opponent = findInAllCharacter<Opponent>(c => c.value.id == character.id);

      executeAbility(target(action, opponent as Store<PlayerCharacter | Opponent>));
    }

    setPreventPlayerAction(false)
  }

  createEffect(function lockPlayerActionOnOpponentTurn() {
    setPreventPlayerAction(!canPlayerAct() && (!!defeatModalData() || !!victoryModalData()))
  })

  createEffect(async function opponentTurn() {
    if (canPlayerAct() || !!defeatModalData() || !!victoryModalData()) return;

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
      const lastAttackResult = logs().findLast(log => log.type == 'OPPONENT' && log.result?.success)?.result as (AttackResult & { success: true }) | undefined

      if (!lastAttackResult) {
        return
      }

      setPreventPlayerAction(true)
      await seconds(1)

      setDefeatModalData(lastAttackResult)
    }
  });

  createEffect(async function victory() {
    if (props.battle.opponents.every(character => character.value.hp.current <= 0)) {
      const lastAttackResult = logs().findLast(log => log.type == 'PARTY' && log.result?.success)?.result as (AttackResult & { success: true }) | undefined

      if (!lastAttackResult) {
        return
      }

      setPreventPlayerAction(true)

      const totalXP = getTotalXPPerPartyMember(props.battle);
      setVictoryModalData({
        attackResult: lastAttackResult,
        xpGained: totalXP,
      })
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
        <AttackDiceThrowModal onClose={() => {
          setDiceThrowModal(null);
          diceThrowModalCallback()();
          setDiceThrowModalCallback(() => () => { })
        }} values={diceThrowModal()} />
        <DefeatModal onClose={() => {
          (props.onBattleEnd ?? (() => navigate('/map')))('defeat')
        }} fatalAttackResult={defeatModalData()} />

        <VictoryModal onClose={() => {
          const totalXP = getTotalXPPerPartyMember(props.battle);

          for (const character of props.battle.party) {
            character.set("xp", "current", prev => prev + totalXP);
          }

          (props.onBattleEnd ?? (() => navigate('/map')))('victory')
        }} fatalAttackResult={victoryModalData()?.attackResult} xpGained={victoryModalData()?.xpGained} />

        <Logs logs={logs()} />

        <div class="w-full mt-auto flex flex-col">
          <button
            disabled={preventPlayerAction()}
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

        <Initiative
          canPartyAct={!preventPlayerAction()}
          currentPlayerHaveAction={currentPlayerHaveAction}
          findInAllCharacter={findInAllCharacter}
          initiatives={initiatives}
          onCharacterClick={onCharacterClick}
          selectedAction={selectedAction()}
          turn={turn()}
        />

        <ActionTabs
          disabled={preventPlayerAction()}
          currentPlayer={props.battle.party[0]}
          currentPlayerHaveAction={currentPlayerHaveAction}
          selectedAction={selectedAction()}
          setSelectedAction={setSelectedAction}
          usePlayerAction={usePlayerActionCost}
        />
      </div>
    </Layout>
  );
}
