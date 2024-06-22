import { makePersisted } from "@solid-primitives/storage";
import { ParentProps, createContext, createEffect, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { Store } from "~/game/battle/battle";
import { BaseSkill, PlayerCharacter, Skill, baseSkills, getBaseSkill, getProficiencyBonus, isSkillProficient, skills } from "~/game/character/character";
import { classes } from "~/game/character/classes/classes";
import { modifierUsedEventBus } from "~/game/character/modifiers";
import { d20, skillModifier } from "~/utils/dice"



export const nextLevelXPGap = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
} satisfies Record<number, number>

export const proficencyByLevel = {
  1: 2,
  2: 2,
  3: 2,
  4: 2,
  5: 3,
} satisfies Record<number, number>

export function skillCheck(character: PlayerCharacter, skill: BaseSkill | Skill, dd: number) {
  let stat = 0
  let proficency = 0

  if (skill in baseSkills) {
    stat = getBaseSkill(character, skill as BaseSkill)
  } else {
    const hasProficiency = isSkillProficient(character, skill as Skill)
    proficency = hasProficiency ? getProficiencyBonus(character) : 0
  }

  return d20(1) + skillModifier(stat) + proficency >= dd
}

export type PlayerContext = { player: PlayerCharacter, setPlayer: SetStoreFunction<PlayerCharacter> }

export const PlayerContext = createContext<PlayerContext>();

export function PlayerProvider(props: ParentProps) {
  const [player, setPlayer] = makePersisted(createStore<PlayerCharacter>({
    id: crypto.randomUUID(),
    name: '',
    level: 1,
    xp: { current: 0, next: nextLevelXPGap[2] },
    hp: { current: 10 },
    inventory: [
    ],
    class: classes[0],
    modifiers: [],
    actions: [],
  }), { name: 'player' })

  createEffect(function levelUp() {
    if (player.xp.current >= player.xp.next) {
      setPlayer('level', prev => prev + 1);
      setPlayer('xp', 'next', nextLevelXPGap[Math.min(player.level, 5) as keyof typeof nextLevelXPGap]);

      alert(`You're now level ${player.level} !`);
    }
  })

  modifierUsedEventBus.listen((usedMod) => {

    if (player.modifiers.some(mod => mod.id == usedMod.id)) {
      if (usedMod.props.state.markedAsDone) {
        setPlayer('modifiers', prev => prev.filter(mod => mod.id != usedMod.id))
      }

      if (usedMod.modifierKey == 'fightingStyleGreatWeaponFighting') {
        alert('You rolled a 1 and rerolled')
      }
    }
  })

  return (
    <PlayerContext.Provider value={{ player, setPlayer }}>
      <div id="player">
        {props.children}
      </div>
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)

  if (context == null) {
    throw new Error("You must use `usePlayer` inside a `<PlayerProvider/>`")
  }

  return context
}

export function usePlayerStore() {
  const { player, setPlayer } = usePlayer()

  return { value: player, set: setPlayer } satisfies Store<PlayerCharacter>
}
