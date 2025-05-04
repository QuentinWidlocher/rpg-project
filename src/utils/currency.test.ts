import { describe, expect, it, test } from "bun:test";
import { cp, formatCp, gp, sp } from "./currency";

type TestProps = {
  cc: Parameters<typeof formatCp>[0],
  options: Parameters<typeof formatCp>[1]
  result: ReturnType<typeof formatCp>
}

const shortNotExhaustive = [
  { cc: cp(1), options: { style: 'short', exhaustive: false }, result: '1 cc' },
  { cc: cp(6), options: { style: 'short', exhaustive: false }, result: '6 cc' },
  { cc: cp(10), options: { style: 'short', exhaustive: false }, result: '1 sc' },
  { cc: cp(23), options: { style: 'short', exhaustive: false }, result: '2 sc' },
  { cc: cp(100), options: { style: 'short', exhaustive: false }, result: '1 gc' },
  { cc: cp(413), options: { style: 'short', exhaustive: false }, result: '4 gc' },

  { cc: sp(1), options: { style: 'short', exhaustive: false }, result: '1 sc' },
  { cc: sp(6), options: { style: 'short', exhaustive: false }, result: '6 sc' },
  { cc: sp(10), options: { style: 'short', exhaustive: false }, result: '1 gc' },
  { cc: sp(23), options: { style: 'short', exhaustive: false }, result: '2 gc' },
  { cc: sp(100), options: { style: 'short', exhaustive: false }, result: '10 gc' },
  { cc: sp(413), options: { style: 'short', exhaustive: false }, result: '41 gc' },

  { cc: gp(1), options: { style: 'short', exhaustive: false }, result: '1 gc' },
  { cc: gp(6), options: { style: 'short', exhaustive: false }, result: '6 gc' },
  { cc: gp(10), options: { style: 'short', exhaustive: false }, result: '10 gc' },
  { cc: gp(23), options: { style: 'short', exhaustive: false }, result: '23 gc' },
  { cc: gp(100), options: { style: 'short', exhaustive: false }, result: '100 gc' },
  { cc: gp(413), options: { style: 'short', exhaustive: false }, result: '413 gc' },
] satisfies TestProps[]

const longNotExhaustive = [
  { cc: cp(1), options: { style: 'long', exhaustive: false }, result: '1 copper coin' },
  { cc: cp(6), options: { style: 'long', exhaustive: false }, result: '6 copper coins' },
  { cc: cp(10), options: { style: 'long', exhaustive: false }, result: '1 silver coin' },
  { cc: cp(23), options: { style: 'long', exhaustive: false }, result: '2 silver coins' },
  { cc: cp(100), options: { style: 'long', exhaustive: false }, result: '1 gold coin' },
  { cc: cp(413), options: { style: 'long', exhaustive: false }, result: '4 gold coins' },

  { cc: sp(1), options: { style: 'long', exhaustive: false }, result: '1 silver coin' },
  { cc: sp(6), options: { style: 'long', exhaustive: false }, result: '6 silver coins' },
  { cc: sp(10), options: { style: 'long', exhaustive: false }, result: '1 gold coin' },
  { cc: sp(23), options: { style: 'long', exhaustive: false }, result: '2 gold coins' },
  { cc: sp(100), options: { style: 'long', exhaustive: false }, result: '10 gold coins' },
  { cc: sp(413), options: { style: 'long', exhaustive: false }, result: '41 gold coins' },

  { cc: gp(1), options: { style: 'long', exhaustive: false }, result: '1 gold coin' },
  { cc: gp(6), options: { style: 'long', exhaustive: false }, result: '6 gold coins' },
  { cc: gp(10), options: { style: 'long', exhaustive: false }, result: '10 gold coins' },
  { cc: gp(23), options: { style: 'long', exhaustive: false }, result: '23 gold coins' },
  { cc: gp(100), options: { style: 'long', exhaustive: false }, result: '100 gold coins' },
  { cc: gp(413), options: { style: 'long', exhaustive: false }, result: '413 gold coins' },
] satisfies TestProps[]

const shortExhaustive = [
  { cc: cp(1), options: { style: 'short', exhaustive: true }, result: '1 cc' },
  { cc: cp(6), options: { style: 'short', exhaustive: true }, result: '6 cc' },
  { cc: cp(10), options: { style: 'short', exhaustive: true }, result: '1 sc' },
  { cc: cp(23), options: { style: 'short', exhaustive: true }, result: '2 sc, 3 cc' },
  { cc: cp(100), options: { style: 'short', exhaustive: true }, result: '1 gc' },
  { cc: cp(413), options: { style: 'short', exhaustive: true }, result: '4 gc, 1 sc, 3 cc' },

  { cc: sp(1), options: { style: 'short', exhaustive: true }, result: '1 sc' },
  { cc: sp(6), options: { style: 'short', exhaustive: true }, result: '6 sc' },
  { cc: sp(10), options: { style: 'short', exhaustive: true }, result: '1 gc' },
  { cc: sp(23), options: { style: 'short', exhaustive: true }, result: '2 gc, 3 sc' },
  { cc: sp(100), options: { style: 'short', exhaustive: true }, result: '10 gc' },
  { cc: sp(413), options: { style: 'short', exhaustive: true }, result: '41 gc, 3 sc' },

  { cc: gp(1), options: { style: 'short', exhaustive: true }, result: '1 gc' },
  { cc: gp(6), options: { style: 'short', exhaustive: true }, result: '6 gc' },
  { cc: gp(10), options: { style: 'short', exhaustive: true }, result: '10 gc' },
  { cc: gp(23), options: { style: 'short', exhaustive: true }, result: '23 gc' },
  { cc: gp(100), options: { style: 'short', exhaustive: true }, result: '100 gc' },
  { cc: gp(413), options: { style: 'short', exhaustive: true }, result: '413 gc' },
] satisfies TestProps[]

const longExhaustive = [
  { cc: cp(1), options: { style: 'long', exhaustive: true }, result: '1 copper coin' },
  { cc: cp(6), options: { style: 'long', exhaustive: true }, result: '6 copper coins' },
  { cc: cp(10), options: { style: 'long', exhaustive: true }, result: '1 silver coin' },
  { cc: cp(23), options: { style: 'long', exhaustive: true }, result: '2 silver coins and 3 copper coins' },
  { cc: cp(100), options: { style: 'long', exhaustive: true }, result: '1 gold coin' },
  { cc: cp(413), options: { style: 'long', exhaustive: true }, result: '4 gold coins, 1 silver coin, and 3 copper coins' },

  { cc: sp(1), options: { style: 'long', exhaustive: true }, result: '1 silver coin' },
  { cc: sp(6), options: { style: 'long', exhaustive: true }, result: '6 silver coins' },
  { cc: sp(10), options: { style: 'long', exhaustive: true }, result: '1 gold coin' },
  { cc: sp(23), options: { style: 'long', exhaustive: true }, result: '2 gold coins and 3 silver coins' },
  { cc: sp(100), options: { style: 'long', exhaustive: true }, result: '10 gold coins' },
  { cc: sp(413), options: { style: 'long', exhaustive: true }, result: '41 gold coins and 3 silver coins' },

  { cc: gp(1), options: { style: 'long', exhaustive: true }, result: '1 gold coin' },
  { cc: gp(6), options: { style: 'long', exhaustive: true }, result: '6 gold coins' },
  { cc: gp(10), options: { style: 'long', exhaustive: true }, result: '10 gold coins' },
  { cc: gp(23), options: { style: 'long', exhaustive: true }, result: '23 gold coins' },
  { cc: gp(100), options: { style: 'long', exhaustive: true }, result: '100 gold coins' },
  { cc: gp(413), options: { style: 'long', exhaustive: true }, result: '413 gold coins' },
] satisfies TestProps[]

describe('Currency', () => {
  describe('formatCp()', () => {
    describe('short + exhaustive', () => {
      test.each(shortExhaustive.map((({ cc, options: { style, exhaustive }, result }) => [cc, result, style, exhaustive])))("%i cc should print %p", (cc, result, style, exhaustive) => {
        expect(formatCp(cc, { style, exhaustive })).toEqual(result)
      })
    })
    describe('long + exhaustive', () => {
      test.each(longExhaustive.map((({ cc, options: { style, exhaustive }, result }) => [cc, result, style, exhaustive])))("%i cc should print %p", (cc, result, style, exhaustive) => {
        expect(formatCp(cc, { style, exhaustive })).toEqual(result)
      })
    })
    describe('short + not exhaustive', () => {
      test.each(shortNotExhaustive.map((({ cc, options: { style, exhaustive }, result }) => [cc, result, style, exhaustive])))("%i cc should print %p", (cc, result, style, exhaustive) => {
        expect(formatCp(cc, { style, exhaustive })).toEqual(result)
      })
    })
    describe('long + not exhaustive', () => {
      test.each(longNotExhaustive.map((({ cc, options: { style, exhaustive }, result }) => [cc, result, style, exhaustive])))("%i cc should print %p", (cc, result, style, exhaustive) => {
        expect(formatCp(cc, { style, exhaustive })).toEqual(result)
      })
    })
  })
})
