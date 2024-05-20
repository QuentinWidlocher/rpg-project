import { sum } from "lodash-es"
import { NonNegativeInteger } from "type-fest"

export type Dice = { amount: number, sides: number }

export function d(sides: number) {
  return Math.floor(Math.random() * sides) + 1
}

type ArrayOrValue<T extends number | undefined> = T extends 1 ? number : T extends 0 ? number : T extends undefined ? number : number[]

function _dX(sides: number) {
  return function <T extends number>(number: NonNegativeInteger<T>): ArrayOrValue<T> {
    if (number == 0) {
      return 0 as ArrayOrValue<T>
    } else if (number && number > 1) {
      return new Array(number).map(_ => d(sides)) as ArrayOrValue<T>
    } else {
      return d(sides) as ArrayOrValue<T>
    }
  }
}

export const d20 = _dX(20)
export const d12 = _dX(12)
export const d10 = _dX(10)
export const d8 = _dX(8)
export const d6 = _dX(6)
export const d4 = _dX(4)


export function skillModifier(stat: number) {
  return Math.floor(stat / 2 - 5)
}

export function dX(dice: Dice) {
  return sum(new Array(dice.amount).fill(undefined).map(_ => d(dice.sides)))
}

export function stringifyDice(dice: Dice) {
  return `${dice.amount}d${dice.sides}`
}
