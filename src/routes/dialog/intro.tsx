import { sum } from "lodash-es";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { IconoirPlus } from "~/components/icons/Plus";
import { Equipment } from "~/components/inventory/Equipment";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { createActionRef } from "~/game/character/actions";
import {
  BaseSkill,
  Skill,
  getMaxHp,
  getSkillLabel,
} from "~/game/character/character";
import {
  Class,
  classConfigs,
  classes,
  getClassLabel,
} from "~/game/character/classes/classes";
import {
  fighterAbilities,
  fightingStyles,
} from "~/game/character/classes/fighter";
import {
  Modifier,
  ModifierRef,
  createModifierRef,
} from "~/game/character/modifiers";
import { makeDialog } from "~/game/dialog/dialog";
import { createItem, ItemId, items } from "~/game/items/items";
import { skillModifier } from "~/utils/dice";

export default function IntroDialog() {
  const { player, setPlayer } = usePlayer();
  const { setFlag } = useFlags();

  const [baseSkillValues, setBaseSkillValues] = createSignal<
    Record<BaseSkill, number>
  >({
    strength: 10,
    dexterity: 10,
    wisdom: 10,
    charisma: 10,
    constitution: 10,
    intelligence: 10,
  });
  const [selectedSkills, setSelectedSkills] = createSignal<
    [Skill | undefined, Skill | undefined]
  >([undefined, undefined]);
  const [selectedFightingStyle, setSelectedFightingStyle] = createSignal<
    keyof typeof fightingStyles | null
  >(null);

  const [equipment, setEquipment] = createStore<(null | ItemId)[][]>(
    new Array(classConfigs.fighter.startingEquipment.length)
      .fill(null)
      .map((_, i) =>
        new Array(classConfigs.fighter.startingEquipment[i].length).fill(null),
      ),
  );
  const [choices, setChoices] = createStore<any>(
    new Array(classConfigs.fighter.startingEquipment.length)
      .fill(null)
      .map((_, i) =>
        new Array(classConfigs.fighter.startingEquipment[i].length)
          .fill(null)
          .map(
            (_, j) =>
              new Array(classConfigs.fighter.startingEquipment[i][j].length ?? 1),
          ),
      ),
  );
  const [selectedChoices, setSelectedChoices] = createStore<any>(
    new Array(classConfigs.fighter.startingEquipment.length).fill(null),
  );

  const [modifiers, setModifiers] = createSignal<ModifierRef[]>([]);

  return (
    <DialogComponent
      dialog={makeDialog([
        {
          text: () =>
            `Welcome in the realm of Celtria, a land of miracles and wonders.\n\nNah I'm just kidding, the story is not yet written, it's just a placeholder introduction, you won't see it again.`,
          enterFunction: props => {
            setPlayer("inventory", []); // reset the inventory if the user refreshes the intro after chosing their weapons
            setPlayer("modifiers", []); // reset the inventory if the user refreshes the intro after chosing their weapons
          },
        },
        {
          id: "character-infos",
          text: () => {
            function ValueSelector(props: { title: string; prop: BaseSkill }) {
              return (
                <div class="flex-1 p-3 rounded-box bg-base-300 flex flex-col gap-2">
                  <span>{props.title}</span>
                  <input
                    min={10}
                    max={20}
                    type="number"
                    class="input w-full"
                    value={baseSkillValues()[props.prop]}
                    onInput={e => {
                      setBaseSkillValues(prev => ({
                        ...prev,
                        [props.prop]: e.currentTarget.valueAsNumber,
                      }));
                    }}
                  />
                  <span class="text-center">
                    +{skillModifier(baseSkillValues()[props.prop]) || 0}
                  </span>
                </div>
              );
            }

            return (
              <>
                Tell me about yourself <br />
                <br />
                <div class="flex flex-col gap-5 p-2">
                  <div>
                    What's your name ? <br />
                    <input
                      class="input w-full input-bordered"
                      value={player.name}
                      onInput={e => setPlayer("name", e.currentTarget.value)}
                    />
                  </div>
                  <div>
                    What's your class ? <br />
                    <select
                      class="w-full input-bordered select"
                      value={player.class}
                      onChange={e => setPlayer("class", e.currentTarget.value as Class)}
                    >
                      {classes.map(clazz => (
                        <option value={clazz} disabled={clazz != "fighter"}>
                          {getClassLabel(clazz)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span>
                    You have{" "}
                    {75 - sum(Object.values(baseSkillValues()).map(x => x || 10))} points
                    to allocate
                  </span>
                  <div class="flex gap-2 flex-wrap">
                    <ValueSelector prop="strength" title="Strength" />
                    <ValueSelector prop="dexterity" title="Dexterity" />
                    <ValueSelector prop="constitution" title="Constitution" />
                    <ValueSelector prop="intelligence" title="Intelligence" />
                    <ValueSelector prop="wisdom" title="Wisdom" />
                    <ValueSelector prop="charisma" title="Charisma" />
                  </div>
                </div>
              </>
            );
          },
          exitFunction: props => {
            if (!player.name) {
              alert("You need to have a name.");
              props.setNext("character-infos");
              return;
            }

            if (sum(Object.values(baseSkillValues())) != 75) {
              alert("You need to set all your stats.");
              props.setNext("character-infos");
              return;
            }

            if (confirm("Are you sure ? You won't be able to change theses.")) {
              setModifiers(prev => [
                ...prev,
                ...Object.entries(baseSkillValues()).map(([skill, value]) =>
                  createModifierRef("baseSkillInitialValue", {
                    skill: skill as BaseSkill,
                    value,
                  }),
                ),
                ...classConfigs[player.class].proficiencies,
                createModifierRef("equippedArmorsAC", {}),
                createModifierRef("equippedShieldAC", {}),
                createModifierRef("classHitPoints", {}),
              ]);
            } else {
              props.setNext("character-infos");
            }
          },
        },
        {
          id: "skills",
          text: () => {
            return (
              <>
                <div class="flex flex-col gap-5 p-2">
                  <label class="form-control">
                    <span class="label">Choose two skill proficiencies</span>
                    <div class="flex gap-5">
                      <select
                        class="w-full input-bordered select"
                        value={player.class}
                        onChange={e =>
                          setSelectedSkills(prev => [
                            e.currentTarget.value as Skill,
                            prev[1],
                          ])
                        }
                      >
                        {classConfigs[player.class].availableSkills.map(skill => (
                          <option disabled={selectedSkills().includes(skill)} value={skill}>
                            {getSkillLabel(skill)}
                          </option>
                        ))}
                      </select>
                      <select
                        class="w-full input-bordered select"
                        value={player.class}
                        onChange={e =>
                          setSelectedSkills(prev => [
                            prev[0],
                            e.currentTarget.value as Skill,
                          ])
                        }
                      >
                        {classConfigs[player.class].availableSkills.map(skill => (
                          <option disabled={selectedSkills().includes(skill)} value={skill}>
                            {getSkillLabel(skill)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label class="form-control">
                    <span class="label">Choose a fighting style</span>
                    <div class="join join-vertical">
                      {(
                        Object.entries(fightingStyles) as Array<
                          [key: keyof typeof fightingStyles, Modifier]
                        >
                      ).map(([key, mod]) => (
                        <div class="collapse join-item bg-base-100">
                          <input
                            type="radio"
                            name="fightingStyle"
                            checked={key == selectedFightingStyle()}
                            onChange={e => {
                              if (e.currentTarget.checked) {
                                setSelectedFightingStyle(key);
                              }
                            }}
                          />
                          <div class="collapse-title text-xl font-medium pr-3">
                            <div class="flex justify-between items-center">
                              <span>
                                {mod.title} {key == selectedFightingStyle()}{" "}
                              </span>
                              <input
                                type="checkbox"
                                class="checkbox checkbox-primary"
                                checked={key == selectedFightingStyle()}
                              />
                            </div>
                          </div>
                          <div class="collapse-content">{mod.description}</div>
                        </div>
                      ))}
                    </div>
                  </label>
                </div>
              </>
            );
          },
          exitFunction: props => {
            console.log("exitFunction");
            if (selectedSkills().filter(Boolean).length != 2) {
              alert("You must select two skills");
              props.setNext("skills");
            } else if (!selectedFightingStyle()) {
              alert("You must select a fightingStyles");
              props.setNext("skills");
            }
            {
              setModifiers(prev => [
                ...prev,
                createModifierRef("fighterProficiencies", {
                  skills: [selectedSkills()[0]!, selectedSkills()[1]!],
                }),
                createModifierRef(selectedFightingStyle()!, {}),
              ]);
              setPlayer("modifiers", prev => [...prev, ...modifiers()]);
            }
          },
        },
        {
          id: "startingEquipment",
          text: () => (
            <>
              <h3 class="mb-5">Choose your starting equipment</h3>
              <ul class="not-prose">
                {classConfigs.fighter.startingEquipment.map((choice, i) => (
                  <>
                    {i > 0 ? (
                      <div class="divider divider-primary">
                        <span class="text-primary text-lg">
                          <IconoirPlus />
                        </span>
                      </div>
                    ) : null}
                    <li>
                      <ul class="flex flex-col gap-2">
                        {choice.map((itemIds, j) => (
                          <li class="form-control">
                            <label class="btn bg-base-100 justify-start flex-nowrap">
                              <input
                                class="radio radio-sm radio-primary -ml-1 mr-1"
                                type="radio"
                                name={`choice-${i}`}
                                checked={selectedChoices[i] == j}
                                onChange={e => {
                                  setEquipment(
                                    i,
                                    itemIds.map((itemId, k) =>
                                      Array.isArray(itemId) ? choices[i][j][k] : itemId,
                                    ),
                                  );
                                  setSelectedChoices(i, j);
                                }}
                              />
                              {itemIds.map((itemId, k) => (
                                <>
                                  {k > 0 ? (
                                    <li>
                                      <IconoirPlus />
                                    </li>
                                  ) : null}
                                  <li class="shrink">
                                    {Array.isArray(itemId) ? (
                                      <select
                                        class="select select-sm select-primary w-full"
                                        onChange={e => {
                                          if (selectedChoices[i] == j) {
                                            setEquipment(i, k, e.currentTarget.value as ItemId);
                                          }
                                          setChoices(i, j, k, e.currentTarget.value as ItemId);
                                        }}
                                      >
                                        <option>Choose one</option>
                                        {itemId.map(id => (
                                          <option value={id}>{items[id].name}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      items[itemId].name
                                    )}
                                  </li>
                                </>
                              ))}
                            </label>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </>
                ))}
              </ul>
            </>
          ),
          exitFunction: props => {
            if (equipment.flat().some(e => e == null)) {
              alert("You must select all available equipement");
              props.setNext("startingEquipment");
            } else {
              setPlayer("inventory", prev => [
                ...prev,
                ...equipment
                  .flat()
                  .filter(Boolean)
                  .map(e => ({ ...createItem(items[e]), equipped: false })),
              ]);
            }
          },
        },
        {
          id: "equipment",
          text: () => (
            <div class="not-prose">
              <h3 class="mb-5">Equip what you need</h3>
              <Equipment
                inventory={player.inventory}
                setInventory={(...args: any[]) =>
                  setPlayer("inventory", ...(args as [any]))
                }
              />
            </div>
          ),
        },
        {
          id: "actions",
          text: () => (
            <div class="not-prose">
              <h3 class="mb-5">Your {player.class} abilities :</h3>
              <ul>
                {Object.values(fighterAbilities).map(ability => (
                  <li>{ability.title}</li>
                ))}
              </ul>
            </div>
          ),
          exitFunction: () => {
            setPlayer(
              "actions",
              player.actions.length,
              createActionRef("secondWind", {}),
            );
            setPlayer(
              "actions",
              player.actions.length,
              createActionRef("actionSurge", {}),
            ); // @FIXME remove (not until lvl 2)
            setPlayer("hp", "current", getMaxHp(player));
          },
        },
        {
          text: () => `Well, time to begin your journey !`,
          exitFunction: () => {
            setFlag("cutscene.intro");
          },
        },
      ])}
    />
  );
}
