import { ConditionalKeys } from "type-fest";
import { gp } from "~/utils/currency";
import { Dice } from "~/utils/dice";
import { weapons } from "./weapons";

export type Item = {
  name: string
  value: number
} & (
    | { type: 'weapon', equipped?: boolean, subType: 'melee' | 'ranged', rank: 'simple' | 'martial', hitDice: Dice, tags: Array<'two-handed' | 'versatile' | 'finesse' | 'thrown' | 'light' | 'heavy'> }
    | { type: 'armor', equipped?: boolean, subType: 'light' | 'medium' | 'heavy' | 'shield', armorClass: number, useDex?: boolean }
  )

export const items = {
  chainMail: { name: 'Chain Mail', type: 'armor', subType: 'heavy', armorClass: 16, value: gp(75) },
  leatherArmor: { name: 'Leather armor', type: 'armor', subType: 'light', armorClass: 11, value: gp(10), useDex: true },
  shield: { name: 'Shield', type: 'armor', subType: 'shield', armorClass: 2, value: gp(10) },
  ...weapons,
} satisfies Record<string, Item>

export type ItemId = keyof typeof items

export type MartialWeapons = ConditionalKeys<typeof items, { type: 'weapon', rank: 'martial' }>
export type SimpleWeapons = ConditionalKeys<typeof items, { type: 'weapon', rank: 'simple' }>

export const simpleWeapons = (Object.entries(items) as Array<[ItemId, Item]>).filter(([_id, item]) => item.type == 'weapon' && item.rank == 'simple').map(([id, _item]) => id) as SimpleWeapons[]
export const martialWeapons = (Object.entries(items) as Array<[ItemId, Item]>).filter(([_id, item]) => item.type == 'weapon' && item.rank == 'martial').map(([id, _item]) => id) as MartialWeapons[]
