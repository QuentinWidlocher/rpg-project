import { SetStoreFunction } from "solid-js/store";
import { CharacterCreationState } from ".";
import { usePlayer } from "~/contexts/player";
import { PlayerCharacter, Skill, getSkillLabel } from "~/game/character/character";
import { classConfigs } from "~/game/character/classes/classes";
import { fightingStyles } from "~/game/character/classes/fighter/modifiers";
import { createModifierRef } from "~/game/character/modifiers";
import { PartialScene } from "~/game/dialog/dialog";

const id = "skills";

export function skillsPage(pageProps: {
	setModifiers: SetStoreFunction<Record<string, PlayerCharacter["modifiers"]>>;
}): PartialScene<CharacterCreationState> {
	const { player } = usePlayer();

	return {
		choices: [
			{ effect: props => props.setNext(-1), text: "Back" },
			{
				condition: props => {
					if (props.state.selectedSkills.filter(Boolean).length != 2) {
						return { success: false, tooltip: "You must select two skills" };
					}

					if (!props.state.selectedFightingStyle) {
						return { success: false, tooltip: "You must select a fighting style" };
					}

					return true;
				},
				text: "Continue",
				visibleOnFail: true,
			},
		],
		exitFunction: props => {
			pageProps.setModifiers(id, [
				createModifierRef("fighterProficiencies", {
					skills: [props.state.selectedSkills[0]!, props.state.selectedSkills[1]!],
				}),
				createModifierRef(props.state.selectedFightingStyle!, {}),
			]);
		},
		id,
		text: props => {
			return (
				<>
					<div class="flex flex-col gap-5 p-2">
						<label class="form-control">
							<span class="label">Choose two skill proficiencies</span>
							<div class="flex gap-5">
								<select
									class="w-full input-bordered select"
									value={props.state.selectedSkills[0] ?? undefined}
									onChange={e => props.setState("selectedSkills", prev => [e.currentTarget.value as Skill, prev[1]])}
								>
									{classConfigs[player.class].availableSkills.map(skill => (
										<option disabled={props.state.selectedSkills.includes(skill)} value={skill}>
											{getSkillLabel(skill)}
										</option>
									))}
								</select>
								<select
									class="w-full input-bordered select"
									value={props.state.selectedSkills[1] ?? undefined}
									onChange={e => props.setState("selectedSkills", prev => [prev[0], e.currentTarget.value as Skill])}
								>
									{classConfigs[player.class].availableSkills.map(skill => (
										<option disabled={props.state.selectedSkills.includes(skill)} value={skill}>
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
										[key: keyof typeof fightingStyles, (typeof fightingStyles)[keyof typeof fightingStyles]]
									>
								).map(([key, mod]) => (
									<div class="collapse join-item bg-base-100">
										<input
											type="radio"
											name="fightingStyle"
											checked={key == props.state.selectedFightingStyle}
											onChange={e => {
												if (e.currentTarget.checked) {
													props.setState("selectedFightingStyle", key);
												}
											}}
										/>
										<div class="collapse-title text-xl font-medium pr-3">
											<div class="flex justify-between items-center">
												<span>
													{mod.title} {key == props.state.selectedFightingStyle}{" "}
												</span>
												<input
													type="checkbox"
													class="checkbox checkbox-primary"
													checked={key == props.state.selectedFightingStyle}
												/>
											</div>
										</div>
										<div class="collapse-content">{typeof mod.description == "function" ? null : mod.description}</div>
									</div>
								))}
							</div>
						</label>
					</div>
				</>
			);
		},
	};
}
