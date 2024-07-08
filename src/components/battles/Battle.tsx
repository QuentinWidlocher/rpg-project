import { createEffect, createSignal, onCleanup } from "solid-js";
import Layout from "../Layout";
import { twJoin } from "tailwind-merge";
import { useNavigate } from "@solidjs/router";
import { PlayerCharacter, getAvailableWeaponsActions, getAvailableAbilitiesActions } from "~/game/character/character";
import { Battle, Character, getAllInitiatives, getTotalXPPerPartyMember, opponentAttackThrow, ActionCost, getMaxHp, Store, actionCosts, AttackResult } from "~/game/battle/battle";
import { SetStoreFunction } from "solid-js/store";
import { Opponent } from "~/game/character/opponents";
import { type Action, executeAttack, executeAbility } from "~/game/character/actions";
import { isAbility, isPlayerCharacter, isSourced, isWeaponAttack, target } from "~/game/character/guards";
import { intersection } from "lodash-es";
import { Action as ActionComponent } from "./Action";
import { Log, Logs } from "./Logs";
import { DiceThrow } from "./DiceThrow";

const inflictDamageProps = (amount: number) => ['hp', 'current', (prev: number) => prev - amount] as const

export function BattleComponent(props: { battle: Battle }) {
  const initiatives = getAllInitiatives(props.battle)

  const [round, setRound] = createSignal(0)
  const [logs, setLogs] = createSignal<Log[]>([])
  const [selectedAction, setSelectedAction] = createSignal<Action | null>(null)
  const [diceThrowModal, setDiceThrowModal] = createSignal<AttackResult | null>(null)

  const navigate = useNavigate()

  function findInAllCharacter<T extends Character = Opponent | PlayerCharacter>(predicate: (character: { value: Character }) => boolean) {
    let foundCharacter

    foundCharacter ??= props.battle.opponents.find(predicate)
    foundCharacter ??= props.battle.party.find(predicate)

    // @FIXME unsecure
    return foundCharacter as unknown as { value: T, set: SetStoreFunction<T> }
  }

  const charactersInOrder = () => initiatives.map((initiative) => ({
    ...initiative,
    ...findInAllCharacter(character => character.value.id == initiative.id)!.value
  }))

  const activeCharacterId = () => initiatives[round() % initiatives.length].id;
  const activeCharacter = <T extends Character = Character>() => {
    const activeCharacter = findInAllCharacter(character => character.value.id == activeCharacterId())

    if (!activeCharacter.value) {
      throw new Error('No active character found, maybe the battle is just finished ?')
    }

    // @FIXME unsecure
    return activeCharacter as unknown as { value: T, set: SetStoreFunction<T> }
  }
  const canPlayerAct = () => initiatives[round() % initiatives.length].type == 'PARTY';
  const rotatedInitiative = () => {
    const copy = [...charactersInOrder().filter(character => character.hp.current > 0)]
    copy.push(...copy.splice(0, (round() % initiatives.length + copy.length) % copy.length))
    return copy
  }

  const currentPlayerHaveAction = (costs: ActionCost[]) => {
    const pc = activeCharacter<PlayerCharacter | Opponent>().value
    if (isPlayerCharacter(pc)) {
      return intersection(pc.availableActions, costs).length > 0
    } else {
      return false
    }
  }

  const usePlayerAction = (costs: ActionCost[]) => {
    const pc = activeCharacter<PlayerCharacter | Opponent>().value
    if (isPlayerCharacter(pc)) {
      activeCharacter<PlayerCharacter>().set('availableActions', prev => prev.filter(cost => !costs.includes(cost)))
    }
  }

  createEffect(function opponentTurn() {
    if (canPlayerAct()) return;

    if (activeCharacter().value.hp.current <= 0) {
      setRound(p => p + 1)
      return
    }


    setTimeout(() => {
      const randomTarget = props.battle.party[Math.floor(Math.random() * props.battle.party.length)]
      const result = opponentAttackThrow(activeCharacter<Opponent>().value, randomTarget.value, activeCharacter<Opponent>().value.attacks[0])

      if (result.success) {
        setLogs(prev => [...prev, {
          type: 'OPPONENT',
          message: `${activeCharacter().value.name} attacked ${randomTarget.value.name} for ${result.damage}HP`,
          ...result,
        }])
        randomTarget.set(...inflictDamageProps(result.damage))
      } else {
        setLogs(prev => [...prev, {
          type: 'OPPONENT',
          message: `${activeCharacter().value.name} attacked ${randomTarget.value.name} but missed`,
          ...result
        }])
      }

      setRound(prev => prev + 1)
    }, 2000)
  })

  createEffect(function death() {
    if (props.battle.party.every((character) => character.value.hp.current <= 0)) {
      setTimeout(() => {
        alert("You managed to escape before dying")

        for (const character of props.battle.party) {
          character.set('hp', 'current', getMaxHp(character.value))
        }

        navigate('/map')
      }, 200)
    }
  })

  createEffect(function victory() {
    if (props.battle.opponents.every((character) => character.value.hp.current <= 0)) {
      setTimeout(() => {

        const totalXP = getTotalXPPerPartyMember(props.battle)

        alert(`You win ! (${totalXP} XP)`)

        for (const character of props.battle.party) {
          character.set('xp', 'current', prev => prev + totalXP)
          character.set('hp', 'current', getMaxHp(character.value))
        }

        navigate('/map')
      }, 200)
    }
  })

  onCleanup(() => {
    for (const store of props.battle.party) {
      store.set('availableActions', [...actionCosts])
    }
  })

  return <Layout compact>
    <div class="h-full flex flex-col">

      <DiceThrow onClose={() => setDiceThrowModal(null)} values={diceThrowModal()} />

      <Logs logs={logs()} />
      <div class="w-full mt-auto flex flex-col">
        <button
          disabled={!canPlayerAct()}
          onClick={() => {
            if (isPlayerCharacter(activeCharacter<PlayerCharacter | Opponent>().value)) {
              activeCharacter<PlayerCharacter>().set('availableActions', [...actionCosts])
            }
            setRound(prev => prev + 1);
          }}
          class="btn btn-wide btn-primary mx-auto"
        >Next round</button>
        <div class="divider after:bg-base-400/20 before:bg-base-400/20 italic text-base-400 p-5">Battle order</div>
      </div>

      <ul id="initiative" class="flex py-5 px-7 gap-10 overflow-visible overflow-x-auto w-full scrollbar scrollbar-track-transparent">
        {[...new Array(2)].map((_, i) => (
          <>
            {(i == 0 ? rotatedInitiative().slice(0, initiatives.length - (round() % initiatives.length)) : charactersInOrder().filter(character => character.hp.current > 0)).map((character, j) => (
              <li
                aria-disabled={!canPlayerAct() || !selectedAction() || (selectedAction()?.cost && !currentPlayerHaveAction([selectedAction()!.cost!]))}
                aria-current={i == 0} // current round
                aria-selected={i == 0 && j == 0} // active character
                class="group shrink-0 radial-progress cursor-pointer aria-disabled:cursor-default text-base-400 hover:aria-disabled:text-base-300 aria-disabled:text-base-300 aria-selected:!text-primary before:-inset-4"
                style={{ '--value': (character.hp.current / getMaxHp(findInAllCharacter(c => c.value.id == character.id).value)) * 100, '--thickness': '4px' }}
                role="progressbar"
                onClick={() => {
                  if (character.type == 'PARTY' || !canPlayerAct() || !selectedAction()) return;

                  const action = selectedAction()!

                  if (action.cost && !currentPlayerHaveAction([action.cost])) {
                    return
                  }

                  if (isWeaponAttack(action) && isSourced(action)) {

                    if (action.cost) {
                      usePlayerAction([action.cost])
                    }

                    const opponent = findInAllCharacter<Opponent>(character => character.value.id == character.value.id)

                    const result = executeAttack(target(action, opponent as Store<PlayerCharacter | Opponent>))

                    setDiceThrowModal(result)

                    if (result.success) {
                      opponent.set(...inflictDamageProps(result.damage))
                      setLogs(prev => [...prev, {
                        type: 'PARTY',
                        message: `${activeCharacter().value.name} attacked ${opponent.value.name} for ${result.damage}HP`,
                        ...result,
                      }])
                    } else {
                      setLogs(prev => [...prev, {
                        type: 'PARTY',
                        message: `${activeCharacter().value.name} attacked ${opponent.value.name} but missed`,
                        ...result,
                      }])
                    }
                  } else if (isAbility(action) && isSourced(action)) {

                  }

                }}
              >
                <div class="avatar placeholder">
                  <div
                    class={twJoin(
                      "flex flex-col text-sm bg-base-400 group-aria-selected:bg-primary mask text-base-200 group-aria-selected:text-primary-content w-24 group-aria-disabled:bg-base-300 group-aria-disabled:text-base-400",
                      character.type == 'OPPONENT' ? 'mask-circle' : 'mask-hexagon'
                    )}
                  >
                    {/* {character.name.split(' ').map(x => x[0].toUpperCase()).join('')} */}
                    <span class="text-center">{character.name}</span>
                    <span>{`${character.hp.current}/${getMaxHp(findInAllCharacter(c => c.value.id == character.id).value)}`}</span>
                  </div>
                </div>
              </li>
            ))}
            <div class="divider divider-horizontal text-base-400 -mx-3">{round() + i + 2}</div>
          </>
        ))}
        <li class="text-base-400 m-auto pr-5">...</li>
      </ul>

      <div role="tablist" class="tabs tabs-boxed p-0 items-center">

        <input type="radio" name="actions" role="tab" class="tab w-full !rounded-btn m-1" aria-label="Weapons" checked />
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

        <input type="radio" name="actions" role="tab" class="tab w-full !rounded-btn m-1" aria-label="Abilities" />
        <div role="tabpanel" class="tab-content bg-base-300 ">
          <div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
            {getAvailableAbilitiesActions(props.battle.party[0]).map(action => (
              <ActionComponent
                action={action}
                available={(!action.cost || currentPlayerHaveAction([action.cost])) && (!action.predicate || action.predicate(action.props, action.source, action.source))}
                onClick={() => {
                  if (action.targetting == 'self' && !action.multipleTargets) {
                    executeAbility(target(action, action.source))
                    if (action.cost) {
                      usePlayerAction([action.cost])
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

        <input type="radio" name="actions" role="tab" class="tab w-full !rounded-btn m-1" aria-label="Other" />
        <div role="tabpanel" class="tab-content bg-base-300 ">
          <div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
            <div
              role="radio"
              onClick={() => navigate('/map')}
              class="btn"
            >
              <span>Run</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Layout>
}
