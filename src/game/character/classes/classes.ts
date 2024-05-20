import { BaseSkill, Skill } from "../character"
import { fighterAvailableSkills } from "./fighter"
import { ModifierRef, createModifierRef } from "../modifiers"
import { ItemId, martialWeapons } from "~/game/items/items"
import { Dice } from "~/utils/dice"

export type ClassConfig = {
  hitDice: Dice,
  savingThrows: BaseSkill[],
  availableSkills: Skill[]
  proficiencies: ModifierRef[]
  startingEquipment: (ItemId | ItemId[])[][][] // 😵 [a list of [choices between [lists of (items | choice of [item in a list])]]
}

export const classes = [
  'fighter',
  'wizard',
  'rogue'
] as const

export type Class = typeof classes[number]

export const classConfigs: Record<Class, ClassConfig> = {
  'fighter': {
    hitDice: { amount: 1, sides: 10 },
    availableSkills: fighterAvailableSkills,
    savingThrows: ['strength', 'constitution'],
    proficiencies: [
      createModifierRef('classWeaponProficiency', { weaponRanks: ['simple', 'martial'] })
    ],
    startingEquipment: [
      [
        ['chainMail'],
        ['leatherArmor', 'longbow'] // @TODO ammunitions
      ],
      [
        [martialWeapons, 'shield'],
        [martialWeapons, martialWeapons],
      ],
      [
        ['lightCrossbow'],
        ['handaxe', 'handaxe']
      ]
    ]
  },
  'wizard': { hitDice: { amount: 1, sides: 8 }, savingThrows: [], availableSkills: [], proficiencies: [], startingEquipment: [] },
  'rogue': { hitDice: { amount: 1, sides: 6 }, savingThrows: [], availableSkills: [], proficiencies: [], startingEquipment: [] },
}

export function getClassLabel(clazz: Class): string {
  switch (clazz) {
    case "fighter": return "Fighter";
    case "rogue": return "Rogue";
    case "wizard": return "Wizard";
  }
}


