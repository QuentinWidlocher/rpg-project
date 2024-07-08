import { type Action, getActionCostIcon, getActionCostLabel } from "~/game/character/actions";

export function Action(props: { action: Action, available: boolean, selected: boolean, onClick: (action: Action) => void }) {
  return <div
    role="radio"
    aria-disabled={!props.available}
    aria-selected={props.selected}
    onClick={() => props.onClick(props.action)}
    class="btn border-2 border-transparent aria-disabled:btn-disabled aria-selected:border-primary flex-col"
  >
    {props.action.cost ? <span title={getActionCostLabel(props.action.cost)}>{props.action.title} {getActionCostIcon(props.action.cost)}</span> : null}
    {props.action.label?.(props.action) || props.action.title}
  </div>
}

