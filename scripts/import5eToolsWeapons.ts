import { camelCase, flatten, pick, property } from 'lodash-es'
import { Output, array, number, object, optional, parse, picklist, regex, safeParse, string } from 'valibot'
import { Weapon } from '~/game/character/character'
import { Item } from '~/game/items/items'

const Weapon5eSchema = object({
  name: string(),
  type: picklist(['M', 'R', 'SCF']),
  value: number(),
  weaponCategory: picklist(['martial', 'simple']),
  property: optional(array(picklist(['V', 'A', 'LD', 'L', 'F', 'T', 'H', 'R', '2H', 'S']))),
  dmg1: optional(string([regex(/(\d+d\d+|\d)/)])),
  dmgType: optional(picklist(['S', 'P', 'B'])),
  dmg2: optional(string([regex(/\d+d\d+/)])),
})

function mapPropertiesToTag(properties: Output<typeof Weapon5eSchema>['property']): Weapon['tags'] {
  if (!properties || properties.length <= 0) {
    return []
  }

  return properties.map((prop): Weapon['tags'][number] | undefined => {
    switch (prop) {
      case 'V': return 'versatile';
      case '2H': return 'two-handed';
      case 'T': return 'thrown';
      case 'F': return 'finesse';
      case 'L': return 'light';
      case 'H': return 'heavy';
      default: return undefined;
    }
  }).filter(Boolean)
}

const raw = await Bun.file('./scripts/in/weapons.json').json()

const parsed = safeParse(array(Weapon5eSchema), raw, { abortEarly: true })

if (!parsed.success) {
  console.error(JSON.stringify(flatten(parsed.issues), null, 2))
  process.exit(1);
}

const weapons = parsed.output.filter(w => ['M', 'R'].includes(w.type) && w.dmg1 && w.dmgType && w.dmg1.includes('d') && !w.property?.includes('S')) as Array<Output<typeof Weapon5eSchema> & { type: 'M' | 'R', dmg1: string, dmgType: 'S' | 'P' | 'B' }>

const gameWeapons: Item[] = weapons.map(w => ({
  type: 'weapon',
  value: w.value,
  name: w.name,
  subType: w.type == 'M' ? 'melee' : 'ranged',
  hitDice: { amount: parseInt(w.dmg1.split('d')[0]), sides: parseInt(w.dmg1.split('d')[1]) },
  rank: w.weaponCategory,
  tags: mapPropertiesToTag(w.property),
}))

const gameWeaponsRecord = gameWeapons.reduce((obj, weapon) => ({ ...obj, [camelCase(weapon.name)]: weapon }), {} as Record<string, Item>)

Bun.write('./src/game/items/weapons.ts',
  `import { Item } from '~/game/items/items'

export const weapons = ${JSON.stringify(gameWeaponsRecord, null, 2)} satisfies Record<string, Item>;
`)

console.info(`Imported ${gameWeapons.length} weapons`)
