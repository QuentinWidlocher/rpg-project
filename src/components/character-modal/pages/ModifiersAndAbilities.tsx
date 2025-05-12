import { AbilityDisplay } from "~/components/AbilityDisplay";
import { ModifierDisplay } from "~/components/ModifierDisplay";
import { usePlayer } from "~/contexts/player";
import { ActionRefKey, actions, GetAbilityProps } from "~/game/character/actions";
import { modifiers } from "~/game/character/modifier-list";
import { ModifierRefKey } from "~/game/character/modifiers";

export function ModifiersAndAbilities() {
	const { player } = usePlayer();

	return (
		<div class="tabs tabs-lift">
			<input type="radio" name="my_tabs_3" class="tab" aria-label="Features" checked />
			<div class="tab-content bg-base-100 border-base-300 p-6">
				<ul class="flex flex-col gap-5">
					{player.modifiers.map(modifierRef => {
						const modifier = modifiers[modifierRef.modifierKey as ModifierRefKey];

						if (modifier.display) {
							return (
								<li>
									<ModifierDisplay modifier={modifier} props={modifierRef.props} />
								</li>
							);
						} else {
							return null;
						}
					})}
				</ul>
			</div>

			<input type="radio" name="my_tabs_3" class="tab" aria-label="Abilities" />
			<div class="tab-content bg-base-100 border-base-300 p-6">
				<ul class="flex flex-col gap-5">
					{player.actions.map(actionRef => {
						const action = actions[actionRef.actionKey as ActionRefKey];

						return (
							<li>
								<AbilityDisplay ability={action} props={actionRef.props as GetAbilityProps<typeof action>} />
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
