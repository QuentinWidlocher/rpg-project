import { at } from "lodash-es"
import { batch, createEffect, on } from "solid-js"
import { SetStoreFunction, createStore, produce, reconcile } from "solid-js/store"
import { PlayerCharacter } from "~/game/character/character"
import { Item } from "~/game/items/items"
import { stringifyDice } from "~/utils/dice"

const defaultUsedSlots = {
  armor: false,
  mainHand: false,
  offHand: false,
}

function getInventoryTitle(key: Item['type']) {
  switch (key) {
    case 'armor': return 'Armors';
    case 'weapon': return 'Weapons';
  }
}

const longIntl = new Intl.ListFormat('en', { type: 'conjunction', style: 'long' })
const shortIntl = new Intl.ListFormat('en', { type: 'unit', style: 'short' })

export function Equipment(props: { inventory: PlayerCharacter['inventory'], setInventory: SetStoreFunction<PlayerCharacter['inventory']> }) {
  const [usedSlots, setUsedSlots] = createStore(defaultUsedSlots)

  function getSlotToUse(item: Item & { equipped?: boolean }): Array<keyof typeof defaultUsedSlots> {
    if (item.type == 'armor') {
      if (item.subType == 'shield') {
        return ['offHand']
      } else {
        return ['armor']
      }
    } else if (item.tags.includes('two-handed')) {
      return ['mainHand', 'offHand']
    } else {
      if (usedSlots.mainHand) {
        return ['offHand']
      } else {
        return ['mainHand']
      }
    }
  }


  const sortedInventory = () => props.inventory.reduce((acc, item, i) => ({ ...acc, [item.type]: [...(acc[item.type] ?? []), [item, i] as [Item, number]] }), {} as Record<Item['type'], Array<[item: Item, index: number]>>)

  createEffect(on(() => props.inventory.map(i => i.equipped), () => {
    setUsedSlots(Object.keys(defaultUsedSlots) as (keyof typeof defaultUsedSlots)[], false)
    batch(() => {
      for (const item of props.inventory) {
        if (item.equipped) {
          setUsedSlots(getSlotToUse(item), true)
        }
      }
    })
  }))


  return <>
    <ul>
      {(Object.entries(sortedInventory()) as Array<[Item['type'], [Item, number][]]>).map(([type, items]) => (
        <>
          <h4 class="mb-2 mt-5">{getInventoryTitle(type)}</h4>
          {items.map(([item, i]) => (
            'equipped' in item ?
              <li class="form-control">
                <label class="btn bg-base-100 justify-start">
                  <input
                    class="checkbox checkbox-primary mr-3"
                    type="checkbox"
                    name={`item-${i}`}
                    checked={props.inventory[i].equipped}
                    disabled={!item.equipped && at(usedSlots, getSlotToUse(item)).some(Boolean)}
                    onChange={(e) => {
                      props.setInventory(i, 'equipped', e.currentTarget.checked)
                    }}
                  />
                  {item.name}
                  <span class="text-xs text-base-400">
                    {shortIntl.format([
                      'armorClass' in item ? `AC + ${item.armorClass}` : null,
                      'hitDice' in item ? stringifyDice(item.hitDice) : null,
                      'tags' in item ? longIntl.format(item.tags) : null,
                    ].filter(Boolean))}
                  </span>
                </label>
              </li > : null
          ))}
        </>
      ))}
    </ul>
  </>;
}
