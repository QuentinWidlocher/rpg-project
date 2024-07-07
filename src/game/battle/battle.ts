import { SetStoreFunction } from "solid-js/store"
import { d20, skillModifier } from "~/utils/dice"
import { sum } from "lodash-es"
import { getMaxHp as getPCMaxHp, getArmorClass as getPCArmorClass, PlayerCharacter, Weapon, getAttackRoll, getInitiative as getCharacterInitiative, getDamageRoll } from "../character/character"
import { OpponentAttack, Opponent, getInitiative as getOpponentInitiative, rollDamage } from "../character/opponents"
import { isOpponent } from "../character/guards"

export type Character = {
  id: string,
  name: string,
  hp: { current: number },
}

export const actionCosts = ['action', 'bonusAction', 'reaction'] as const
export type ActionCost = typeof actionCosts[number]

export type AttackResult = {
  details: {
    attacker: string,
    defender: string,
    attack: string,
    hitRoll: number,
    hitModifier: number,
    defenderAC: number
  }
} & (
    | { success: true, damage: number, details: { damageRoll: number, damageModifier: number } }
    | { success: false }
  )

export function getMaxHp(character: PlayerCharacter | Opponent): number {
  if (isOpponent(character)) {
    return character.hp.max
  } else {
    return getPCMaxHp(character as PlayerCharacter)
  }
}

export function getArmorClass(character: PlayerCharacter | Opponent): number {
  if (isOpponent(character)) {
    return character.armorClass
  } else {
    return getPCArmorClass(character as PlayerCharacter)
  }
}

export function playerCharacterAttackThrow(attacker: PlayerCharacter, defender: PlayerCharacter | Opponent, weapon: Weapon, actionCost: ActionCost = 'action'): AttackResult {
  const { roll = 0, modifier = 0 } = getAttackRoll(weapon, attacker)
  const details: AttackResult['details'] = { attacker: attacker.name, defender: defender.name, attack: weapon.name, defenderAC: getArmorClass(defender), hitRoll: roll, hitModifier: modifier }

  if (roll + modifier > getArmorClass(defender)) {
    const { roll = 0, modifier = 0 } = getDamageRoll(weapon, attacker, actionCost)

    return { success: true as const, damage: roll + modifier, details: { ...details, damageRoll: roll, damageModifier: modifier } }
  } else {
    return { success: false as const, details }
  }
}

export function opponentAttackThrow(attacker: Opponent, defender: PlayerCharacter | Opponent, attack: OpponentAttack): AttackResult {
  const roll = d20(1)
  const modifier = skillModifier(attacker.skills[attack.modifier]) + attacker.proficency
  const details: AttackResult['details'] = { attacker: attacker.name, defender: defender.name, attack: attack.name, defenderAC: getArmorClass(defender), hitRoll: roll, hitModifier: modifier }

  if (roll + modifier > details.defenderAC) {
    const { damage, damageRoll, damageModifier } = rollDamage(attack, attacker)

    return { success: true as const, damage, details: { ...details, damageRoll, damageModifier } }
  } else {
    return { success: false as const, details }
  }
}

export type Store<T> = { value: T, set: SetStoreFunction<T> }

export type Battle = {
  opponents: Array<Store<Opponent>>
  party: Array<Store<PlayerCharacter>>
}

function getXPMultiplier(battle: Battle) {
  switch (battle.opponents.length) {
    case 1:
      return 1

    case 2:
      return 1.5

    case 3:
    case 4:
    case 5:
    case 6:
      return 2

    case 7:
    case 8:
    case 9:
    case 10:
      return 2.5

    case 11:
    case 12:
    case 13:
    case 14:
      return 3

    default:
      return 4
  }

}

export function getTotalXPPerPartyMember(battle: Battle) {
  const totalXP = sum(battle.opponents.map(character => character.value.baseXP))
  const scaledXP = totalXP * getXPMultiplier(battle)
  return Math.round(scaledXP / battle.party.length)
}

export function getAllInitiatives(battle: Battle) {
  const opponents = battle.opponents.map(character => ({
    type: 'OPPONENT' as const,
    id: character.value.id,
    name: character.value.name,
    initiative: getOpponentInitiative(character.value),
  }))

  const party = battle.party.map(character => ({
    type: 'PARTY' as const,
    id: character.value.id,
    name: character.value.name,
    initiative: getCharacterInitiative(character.value),
  }))

  return [...opponents, ...party].sort((a, b) => b.initiative - a.initiative)
}
