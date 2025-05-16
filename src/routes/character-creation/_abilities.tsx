import { SetStoreFunction } from "solid-js/store";
import { Owner, runWithOwner } from "solid-js";
import { CharacterCreationState } from ".";
import { AbilityDisplay } from "~/components/AbilityDisplay";
import { usePlayer } from "~/contexts/player";
import { ActionRefKey, actions, createActionRef } from "~/game/character/actions";
import { PlayerCharacter } from "~/game/character/character";
import { upgradesByClassByLevel } from "~/game/character/classes/upgrades";
import { PartialScene } from "~/game/dialog/dialog";

const id = "actions";

export function abilitiesPage(pageProps: {
	owner: Owner;
	setAbilities: SetStoreFunction<Record<string, PlayerCharacter["actions"]>>;
}): PartialScene<CharacterCreationState> {
	return runWithOwner(pageProps.owner, () => {
		const { player } = usePlayer();

		return {
			choices: [{ effect: props => props.setNext(-1), text: "Back" }, { text: "Continue" }],
			exitFunction: () => {
				pageProps.setAbilities(
					id,
					upgradesByClassByLevel[player.class][player.level].abilities.map(ability =>
						createActionRef(ability.abilityRefKey, "props" in ability ? ability.props : {}),
					),
				);
			},
			id,
			text: () => (
				<div class="not-prose">
					<h3 class="mb-5">Your {player.class} abilities :</h3>
					<ul>
						{Object.values(upgradesByClassByLevel[player.class][player.level].abilities).map(ability => {
							const action = actions[ability.abilityRefKey as ActionRefKey];

							return (
								<li>
									<AbilityDisplay ability={action} props={"props" in ability ? ability.props : ({} as any)} />
								</li>
							);
						})}
					</ul>
				</div>
			),
		};
	})!;
}
