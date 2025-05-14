import { times } from "lodash-es";
import { Setter } from "solid-js";
import { Action as ActionComponent } from "./Action";
import { ActionCost, Store } from "~/game/battle/battle";
import { ActionFromRef, type AnyAction, executeAbility } from "~/game/character/actions";
import { getAvailableAbilitiesActions, getAvailableWeaponsActions, PlayerCharacter } from "~/game/character/character";
import { target } from "~/game/character/guards";

export function ActionTabs(props: {
	currentPlayer: Store<PlayerCharacter>;
	currentPlayerHaveAction: (costs: ActionCost[]) => boolean;
	disabled: boolean;
	selectedAction: ((AnyAction | ActionFromRef) & { id: string }) | null;
	setSelectedAction: Setter<((AnyAction | ActionFromRef) & { id: string }) | null>;
	usePlayerAction: (costs: ActionCost[]) => void;
}) {
	return (
		<div role="tablist" class="tabs tabs-lift p-0">
			<input type="radio" name="actions" role="tab" class="tab flex-1" aria-label="Weapons" checked />
			<div role="tabpanel" class="tab-content bg-base-300 ">
				<div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
					{getAvailableWeaponsActions(props.currentPlayer).flatMap(action => {
						let result = [
							<ActionComponent
								action={action}
								available={!props.disabled && props.currentPlayerHaveAction([action.cost])}
								onClick={() => props.setSelectedAction(action)}
								selected={action.id == props.selectedAction?.id}
							/>,
						];

						if (props.currentPlayer.value.availableExtraAttacks && action.cost == "action") {
							const freeAction = { ...action, cost: undefined };
							result.push(
								...times(props.currentPlayer.value.availableExtraAttacks, () => (
									<ActionComponent
										action={freeAction}
										available={!props.disabled}
										onClick={() => props.setSelectedAction(freeAction)}
										selected={action.id == props.selectedAction?.id}
									/>
								)),
							);
						}

						return result;
					})}
				</div>
			</div>

			<input type="radio" name="actions" role="tab" class="tab flex-1" aria-label="Abilities" />
			<div role="tabpanel" class="tab-content bg-base-300 ">
				<div class="rounded-b-xl p-2 flex flex-nowrap gap-2 overflow-x-auto">
					{getAvailableAbilitiesActions(props.currentPlayer).map(action => {
						return (
							<ActionComponent
								action={action}
								available={
									!props.disabled &&
									(!action.cost || props.currentPlayerHaveAction([action.cost])) &&
									(!action.predicate || action.predicate(action.props, action.source, action.source))
								}
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
								selected={action.title == props.selectedAction?.title && props.selectedAction?.cost == action.cost}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}
