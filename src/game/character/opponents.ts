import { createStore } from "solid-js/store"
import { BaseSkill } from "./character"
import { d, d20, skillModifier } from "~/utils/dice"
import { Character } from "../battle/battle"

export type OpponentAttack = {
  name: string,
  modifier: keyof Opponent['skills'],
  hitDie: number
}

export type Opponent = Character & {
  baseXP: number
  armorClass: number,
  proficency: number,
  attacks: OpponentAttack[],
  skills: Record<BaseSkill, number>
  hp: { current: number, max: number }
}

const challengeXP = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
} as const

export type OpponentTemplate = Omit<Opponent, 'id' | 'hp' | 'skills'> & { hp: number, skills: { [k in keyof Opponent['skills']]: number } }

const opponentTemplates = {
  goblin: {
    name: 'Goblin',
    hp: 7,
    armorClass: 15,
    proficency: 2,
    baseXP: challengeXP['1/4'],
    attacks: [{ name: 'Scimetar', modifier: 'dexterity', hitDie: 6 }],
    skills: {
      strength: 8,
      dexterity: 14,
      constitution: 10,
      intelligence: 10,
      wisdom: 8,
      charisma: 8,
    }
  },
  skeleton: {
    name: 'Skeleton',
    hp: 13,
    armorClass: 13,
    proficency: 2,
    baseXP: challengeXP['1/4'],
    attacks: [{ name: 'Shortsword', modifier: 'dexterity', hitDie: 6 }],
    skills: {
      strength: 10,
      dexterity: 14,
      constitution: 15,
      intelligence: 6,
      wisdom: 8,
      charisma: 5,
    }
  },
  giantRat: {
    name: 'Giant rat',
    hp: 7,
    armorClass: 12,
    proficency: 2,
    baseXP: challengeXP['1/8'],
    attacks: [{ name: 'Bite', modifier: 'dexterity', hitDie: 4 }],
    skills: {
      strength: 7,
      dexterity: 15,
      constitution: 11,
      intelligence: 2,
      wisdom: 10,
      charisma: 4,
    }
  },
  kobold: {
    name: 'Kobold',
    hp: 5,
    armorClass: 12,
    proficency: 2,
    baseXP: challengeXP['1/8'],
    attacks: [{ name: 'Dagger', modifier: 'dexterity', hitDie: 4 }],
    skills: {
      strength: 7,
      dexterity: 15,
      constitution: 9,
      intelligence: 8,
      wisdom: 7,
      charisma: 8,
    }
  },
  rookieGladiator: {
    name: 'Rookie Gladiator',
    hp: 199991,
    armorClass: 16,
    proficency: 2,
    baseXP: challengeXP['1/8'],
    attacks: [{ name: 'Spear', modifier: 'strength', hitDie: 6 }],
    skills: {
      strength: 13,
      dexterity: 12,
      constitution: 12,
      intelligence: 10,
      wisdom: 11,
      charisma: 10,
    }
  }
} satisfies Record<string, OpponentTemplate>

export type OpponentTemplateName = keyof typeof opponentTemplates

export function createOpponent(templateName: OpponentTemplateName) {
  const template = opponentTemplates[templateName]
  const [value, set] = createStore<Opponent>({
    ...template,
    id: crypto.randomUUID(),
    hp: { current: template.hp, max: template.hp },
  })
  return { value, set }
}

export function createOpponents(templateNames: Array<OpponentTemplateName> | Partial<Record<OpponentTemplateName, number>>) {
  if (Array.isArray(templateNames)) {
    return templateNames.map(createOpponent)
  } else {
    return Object.keys(templateNames)
      .flatMap((key) => [...new Array(templateNames[key as OpponentTemplateName])].map(_ => key as OpponentTemplateName)).map(createOpponent)
  }
}

export function getInitiative(opponent: Opponent) {
  return d20(1) + skillModifier(opponent.skills.dexterity)
}

export function rollDamage(attack: OpponentAttack, opponent: Opponent) {
  let damageRoll = d(attack.hitDie)
  let damageModifier = skillModifier(opponent.skills[attack.modifier])
  const damage = damageRoll + damageModifier

  return { damageRoll, damageModifier, damage }
}
