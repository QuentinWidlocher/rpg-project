import { d20, dX, skillModifier } from "~/utils/dice";
import { ModifierRef, getModifierValue } from "./modifiers";
import { ActionCost, Character, Store } from "../battle/battle";
import { Item } from "../items/items";
import { Class } from "./classes/classes";

export type Proficency = boolean // @TODO make it an enum

export const baseSkills = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const
export type BaseSkill = typeof baseSkills[number]

export const skills = {
  strength: ['athletics'] as const,
  dexterity: ['acrobatics', 'sleightOfHand', 'stealth'] as const,
  constitution: [] as const,
  intelligence: ['arcana', 'history', 'investigation', 'nature', 'religion'] as const,
  wisdom: ['animalHandling', 'insight', 'medecine', 'perception', 'survival'] as const,
  charisma: ['deception', 'intimidation', 'performance', 'persuasion'] as const,
} satisfies Record<BaseSkill, string[]>

export type SkillOfBaseSkill<BS extends BaseSkill> = typeof skills[BS][number]
export type BaseSkillOfSkill<S extends Skill> = {
  [bs in BaseSkill]: S extends SkillOfBaseSkill<bs> ? bs : never
}[BaseSkill]

export type StrengthSkills = SkillOfBaseSkill<"strength">
export type DexteritySkills = SkillOfBaseSkill<"dexterity">
export type IntelligenceSkills = SkillOfBaseSkill<"intelligence">
export type WisdomSkills = SkillOfBaseSkill<"wisdom">
export type CharismaSkills = SkillOfBaseSkill<"charisma">

export type Skill = StrengthSkills | DexteritySkills | IntelligenceSkills | WisdomSkills | CharismaSkills

export type PlayerCharacter = Character & {
  modifiers: ModifierRef[]
  xp: { current: number, next: number }
  level: number,
  inventory: Array<Item>,
  class: Class,
}

export type Armor = Item & { equipped: true, type: 'armor' }
export type Weapon = Item & { equipped: true, type: 'weapon' }

export function getSkillLabel(skill: Skill): string {
  switch (skill) {
    case "athletics": return "Athletics";
    case "acrobatics": return "Acrobatics";
    case "sleightOfHand": return "Sleight of hand";
    case "stealth": return "Stealth";
    case "arcana": return "Arcana";
    case "history": return "History";
    case "investigation": return "Investigation";
    case "nature": return "Nature";
    case "religion": return "Religion";
    case "animalHandling": return "Animal handling";
    case "insight": return "Insight";
    case "medecine": return "Medecine";
    case "perception": return "Perception";
    case "survival": return "Survival";
    case "deception": return "Deception";
    case "intimidation": return "Intimidation";
    case "performance": return "Performance";
    case "persuasion": return "Persuasion";
  }
}

export function getInitiative(character: PlayerCharacter) {

  return d20(1) + getModifierValue(character.modifiers, 'initiative', 0)(character)
}

export function getArmorClass(character: PlayerCharacter) {

  return getModifierValue(character.modifiers, 'armorClass', 10)(character)
}

export function getBaseSkill(character: PlayerCharacter, skill: BaseSkill) {

  return getModifierValue(character.modifiers, 'baseSkill', 10)(skill, character)
}

// @FIXME a bit of a hack here since we "mock" a throw to apply the right modifiers
// We should probably filter out some modifiers or something
export function getWeaponDamageModifier(weapon: Weapon, character: PlayerCharacter, actionCost: ActionCost = 'action') {
  const skillMod = skillModifier((weapon.subType == 'ranged' || weapon.tags.includes('finesse')) ? getBaseSkill(character, 'dexterity') : getBaseSkill(character, 'strength'))
  return getModifierValue(character.modifiers, 'damageRoll', { roll: weapon.hitDice.sides, modifier: skillMod })({ roll: weapon.hitDice.sides, modifier: skillMod }, weapon, actionCost, character)
}

export function getAttackRoll(weapon: Weapon, character: PlayerCharacter) {

  const roll = d20(1)
  const skillMod = skillModifier(getBaseSkill(character, (weapon.subType == 'ranged' || weapon.tags.includes('finesse')) ? 'dexterity' : 'strength'))
  const proficencyModifier = isWeaponProficient(character, weapon) ? getProficiencyBonus(character) : 0
  const result = getModifierValue(character.modifiers, 'attackRoll', { roll, modifier: skillMod + proficencyModifier })({ roll, modifier: skillMod + proficencyModifier }, weapon, character)
  return result
}

export function getProficiencyBonus(character: PlayerCharacter) {
  const baseProficiency = Math.floor(2 + (character.level - 1) / 4)
  console.debug('baseProficiency', baseProficiency);
  return getModifierValue(character.modifiers, 'proficiency', baseProficiency)(character)
}

export function getDamageRoll(weapon: Weapon, character: PlayerCharacter, actionCost: ActionCost = 'action') {
  const roll = dX(weapon.hitDice)
  const skillMod = skillModifier((weapon.subType == 'ranged' || weapon.tags.includes('finesse')) ? getBaseSkill(character, 'dexterity') : getBaseSkill(character, 'strength'))
  return getModifierValue(character.modifiers, 'damageRoll', { roll, modifier: skillMod })({ roll, modifier: skillMod }, weapon, actionCost, character)
}

export function getMaxHp(character: PlayerCharacter) {

  return getModifierValue(character.modifiers, 'hitPoints', 0)(character)
}

export function getBaseSkillFromSkill<S extends Skill>(skill: S): BaseSkillOfSkill<S> {
  for (const baseSkill of baseSkills) {
    if ((skills[baseSkill] as SkillOfBaseSkill<typeof baseSkill>[]).includes(skill)) {
      return baseSkill as BaseSkillOfSkill<S>
    }
  }

  throw new Error('Invalid skill')
}

export function isSkillProficient(character: PlayerCharacter, skill: Skill) {
  return getModifierValue(character.modifiers, 'skillProficiency', false)(skill)
}

export function isWeaponProficient(character: PlayerCharacter, weapon: Weapon) {
  return getModifierValue(character.modifiers, 'weaponProficiency', false)(weapon)
}

