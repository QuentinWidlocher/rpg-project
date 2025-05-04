import { getAvailableAbilitiesActions, getAvailableWeaponsActions, PlayerCharacter } from "~/game/character/character";
import { Action as ActionComponent } from "./Action";
import { ActionCost, Store } from "~/game/battle/battle";
import { Setter } from "solid-js";
import { Action, ActionFromRef, type AnyAction, executeAbility } from "~/game/character/actions";
import { target } from "~/game/character/guards";
import { useNavigate } from "@solidjs/router";

export function ActionTabs(props: {
  currentPlayer: Store<PlayerCharacter>,
  currentPlayerHaveAction: (costs: ActionCost[]) => boolean
  disabled: boolean;
  selectedAction: AnyAction | ActionFromRef | null
  setSelectedAction: Setter<AnyAction | ActionFromRef | null>
  usePlayerAction: (costs: ActionCost[]) => void
}) {
  const navigate = useNavigate();

  return (
    <div role="tablist" class="tabs tabs-lift p-0">
      <input type="radio" name="actions" role="tab" class="tab flex-1" aria-label="Weapons" checked />
      <div role="tabpanel" class="tab-content bg-base-300 ">
        <div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
          {getAvailableWeaponsActions(props.currentPlayer).map(action => (
            <ActionComponent
              action={action}
              available={!props.disabled && props.currentPlayerHaveAction([action.cost])}
              onClick={() => props.setSelectedAction(action)}
              selected={action.title == props.selectedAction?.title && props.selectedAction?.cost == action.cost}
            />
          ))}
        </div>
      </div>

      <input type="radio" name="actions" role="tab" class="tab flex-1" aria-label="Abilities" />
      <div role="tabpanel" class="tab-content bg-base-300 ">
        <div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
          {getAvailableAbilitiesActions(props.currentPlayer).map(action => {
            const vals = !props.disabled &&
              (!action.cost || props.currentPlayerHaveAction([action.cost])) &&
              (!action.predicate || action.predicate(action.props, action.source, action.source))
            console.group(action.title)
            console.debug('props.disabled', props.disabled)
            console.debug('action.cost', action.cost)
            console.debug('props.currentPlayerHaveAction([action.cost])', props.currentPlayerHaveAction([action.cost!]))
            console.debug('action.predicate', action.predicate)
            console.debug('action.predicate(action.props, action.source, action.source)', action.predicate?.(action.props, action.source, action.source))
            console.debug('available ?', vals)
            console.groupEnd()
            return (
              <ActionComponent
                action={action}
                available={!props.disabled &&
                  (!action.cost || props.currentPlayerHaveAction([action.cost])) &&
                  (!action.predicate || action.predicate(action.props, action.source, action.source))}
                onClick={() => {
                  if (action.targetting == "self" && !action.multipleTargets) {
                    executeAbility(target(action, action.source));
                    if (action.cost) {
                      props.usePlayerAction([action.cost]);
                    }
                  } else {
                    props.setSelectedAction(action);
                  }
                }}
                selected={action.title == props.selectedAction?.title && props.selectedAction?.cost == action.cost} />
            );
          })}
        </div>
      </div>

      <input type="radio" name="actions" role="tab" class="tab flex-1" aria-label="Other" />
      <div role="tabpanel" class="tab-content bg-base-300 ">
        <div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
          <div role="radio" onClick={() => navigate("/map")} class="btn">
            <span>Run</span>
          </div>
        </div>
      </div>
    </div>

  )
}
