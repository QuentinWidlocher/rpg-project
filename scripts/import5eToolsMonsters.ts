import { camelCase, flatten } from 'lodash-es'
import { any, array, number, object, optional, picklist, record, regex, safeParse, string, union, type Output } from 'valibot'
import { skills, Weapon } from '~/game/character/character'
import { challengeXP, Opponent, OpponentAttack, OpponentTemplate } from '~/game/character/opponents'
import { ParsableDice, parseDice, skillModifier } from '~/utils/dice'

const CrSchema = picklist(Object.keys(challengeXP) as (keyof typeof challengeXP)[])

const Monster5eSchema = object({
  name: string(),
  size: array(picklist(['T', 'S', 'M', 'L', 'H', 'G'])),
  // type: object({
  //   type: union([picklist(['humanoid', 'dragon']), string()]),
  //   tags: array(string())
  // }),
  // alignment: array(picklist(['L', 'C', 'G', 'E', 'N'])),
  ac: array(union([number(), object({
    ac: number(),
    // from: array(string())
  })])),
  hp: object({
    average: number(),
  }),
  // speed: record(picklist(['walk', 'fly', 'swim']), union([number(), object({ number: number() })])),
  str: number(),
  dex: number(),
  con: number(),
  int: number(),
  wis: number(),
  cha: number(),
  // save: record(picklist(['str', 'dex', 'con', 'int', 'wis', 'cha']), string([regex(/([+-])(\d+)/)])),
  // skill: record(picklist(Object.values(skills).flat()), string([regex(/([+-])(\d+)/)])),
  // languages: union([picklist(['Goblin', 'Common', 'Draconic']), string()]),
  cr: union([CrSchema, object({ cr: CrSchema })]),
  // spellcasting: array(any()), // TODO
  // trait: array(any()), // TODO
  action: optional(array(object({
    name: string(),
    entries: array(union([string(), object({})]))
  })))
  // bonus: array(any()), // TODO
  // legendary: array(any()), // TODO
  // environment: array(string()), // TODO
})

function evaluateCR(cr: Output<typeof Monster5eSchema>['cr']) {
  return typeof cr == 'string' ? (new Function(`return ${cr}`))() : (new Function(`return ${cr.cr}`))()
}

function xpFromCR(cr: Output<typeof Monster5eSchema>['cr']) {
  return challengeXP[(typeof cr == 'string' ? cr : cr.cr)]
}

function mapAttackType(string: string): ('melee' | 'ranged')[] {
  switch (string) {
    case 'mw': return ['melee'];
    case 'rw': return ['ranged'];
    case 'mw,rw': return ['melee', 'ranged'];
    case 'ms': return ['melee'];
    case 'rs': return ['ranged'];
    case 'ms,rs': return ['melee', 'ranged'];
    default: return [];
  }
}

function mapBaseSkills(string: string): keyof OpponentTemplate['skills'] | undefined {
  switch (string) {
    case 'str': return 'strength';
    case 'dex': return 'dexterity';
    case 'con': return 'constitution';
    case 'int': return 'intelligence';
    case 'wis': return 'wisdom';
    case 'cha': return 'charisma';
  }
}

function extractAtkFromActionEntries(action: (Output<typeof Monster5eSchema>['action'] & {})[number], stats: Pick<Output<typeof Monster5eSchema>, 'str' | 'dex'>, proficency: number) {
  const entry = action.entries.find(e => typeof e == 'string' && e.startsWith('{@atk') && e.includes('{@hit') && e.includes('{@damage')) as string

  if (!entry) {
    return null
  }

  const match = entry.matchAll(/{@(\w+)\s?(.*?)}/g)

  let result: Partial<OpponentAttack> = { name: action.name }
  for (const [_, tag, value] of match) {
    switch (tag) {
      case 'atk': {
        result.type = mapAttackType(value)[0]
        break;
      }
      case 'hit': {
        const statEntries = (Object.entries(stats) as [keyof typeof stats, number][])
        const statToMatch = parseInt(value) - proficency;
        const sameValueKey = statEntries.find(([_, v]) => skillModifier(v) == statToMatch)?.[0]
        result.toHitBonusSkill = mapBaseSkills(sameValueKey ?? 'str') ?? 'strength'
        break;
      }
      case 'damage': {
        const match = value.match(/(\d+d\d+)\s\+\s(\d)/)
        if (!match) break;
        result.damageDice = parseDice(match[1] as ParsableDice)
        result.damageBonus = parseInt(match[2])
        break;
      }
    }
  }

  if ('type' in result && 'damageBonus' in result && 'damageDice' in result && 'toHitBonusSkill' in result) {
    return result as OpponentAttack
  } else {
    return null
  }
}

const raw = await Bun.file('./scripts/in/monsters.json').json()

const parsed = safeParse(array(Monster5eSchema), raw, { abortEarly: true })

if (!parsed.success) {
  console.error(JSON.stringify(flatten(parsed.issues), null, 2))
  process.exit(1);
}

const monsters = parsed.output;

const gameMonsters: OpponentTemplate[] = monsters.filter(m => m.action).map(m => ({
  name: m.name,
  hp: m.hp.average,
  armorClass: typeof m.ac[0] == 'number' ? m.ac[0] : m.ac[0].ac,
  proficency: Math.ceil(1 + (Math.ceil(evaluateCR(m.cr)) / 4)),
  baseXP: xpFromCR(m.cr),
  attacks: m.action!.map(a => extractAtkFromActionEntries(a, { str: m.str, dex: m.dex }, Math.ceil(1 + (Math.ceil(evaluateCR(m.cr)) / 4)))).filter(Boolean),
  skills: {
    strength: m.str,
    dexterity: m.dex,
    constitution: m.con,
    intelligence: m.int,
    wisdom: m.wis,
    charisma: m.cha,
  }
}))

const gameMonstersRecord = gameMonsters.reduce((obj, monster) => ({ ...obj, [camelCase(monster.name)]: monster }), {} as Record<string, OpponentTemplate>)

Bun.write('./src/game/opponents/monsters.ts',
  `import { type OpponentTemplate } from '~/game/character/opponents'

export const opponentTemplates = ${JSON.stringify(gameMonstersRecord, null, 2)} satisfies Record<string, OpponentTemplate>;
`)

console.info(`Imported ${gameMonsters.length} creatures`)
