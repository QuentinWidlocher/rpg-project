import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { makePersisted } from "@solid-primitives/storage";
import { statPage } from "./_stats";
import { skillsPage } from "./_skills";
import { startingEquipmentPage } from "./_startingEquipment";
import { abilitiesPage } from "./_abilities";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { COUNTRY_NAME } from "~/constants";
import { useDebug } from "~/contexts/debug";
import { useFlags } from "~/contexts/flags";
import { BaseSkill, getMaxHp, PlayerCharacter, Skill } from "~/game/character/character";
import { classConfigs } from "~/game/character/classes/classes";
import { fightingStyles } from "~/game/character/classes/fighter/modifiers";
import { createModifierRef, ModifierRef } from "~/game/character/modifiers";
import { makeDialog } from "~/game/dialog/dialog";
import { ItemId } from "~/game/items/items";
import { usePlayer } from "~/contexts/player";
import { Equipment } from "~/components/inventory/Equipment";

export type CharacterCreationState = {
	baseSkillValues: Record<BaseSkill, number>;
	choices: any[][][]; // @FIXME
	equipment: (null | ItemId)[][];
	selectedFightingStyle: keyof typeof fightingStyles | null;
	selectedSkills: [Skill | null, Skill | null];
	selectedChoices: any[]; // @FIXME
	modifiers: ModifierRef[];
};

export default function CharacterCreation() {
	const { debug } = useDebug();
	const { setFlag } = useFlags();
	const { player, setPlayer } = usePlayer();
	const [modifiers, setModifiers] = makePersisted(createStore<Record<string, PlayerCharacter["modifiers"]>>({}), {
		name: "characterCreationModifiers",
	});
	const [abilities, setAbilities] = makePersisted(createStore<Record<string, PlayerCharacter["actions"]>>({}), {
		name: "characterCreationAbilities",
	});
	const [inventory, setInventory] = makePersisted(createStore<Record<string, PlayerCharacter["inventory"]>>({}), {
		name: "characterCreationInventory",
	});
	const navigate = useNavigate();

	return (
		<DialogComponent<CharacterCreationState>
			hideStatusBar={!debug.enabled}
			initialState={{
				baseSkillValues: { charisma: 10, constitution: 10, dexterity: 10, intelligence: 10, strength: 10, wisdom: 10 },
				choices: new Array(classConfigs.fighter.startingEquipment.length)
					.fill(null)
					.map((_, i) =>
						new Array(classConfigs.fighter.startingEquipment[i].length)
							.fill(null)
							.map((_, j) => new Array(classConfigs.fighter.startingEquipment[i][j].length ?? 1)),
					),
				equipment: new Array(classConfigs.fighter.startingEquipment.length)
					.fill(null)
					.map((_, i) => new Array(classConfigs.fighter.startingEquipment[i].length).fill(null)),
				modifiers: [],
				selectedChoices: new Array(classConfigs.fighter.startingEquipment.length).fill(null),
				selectedFightingStyle: null,
				selectedSkills: [null, null],
			}}
			onDialogStop={() => {
				setPlayer("modifiers", Object.values(modifiers).flat());
				setPlayer("actions", Object.values(abilities).flat());
				setPlayer("hp", "current", getMaxHp(player));

				setTimeout(() => {
					localStorage.removeItem("characterCreationModifiers");
					localStorage.removeItem("characterCreationAbilities");
					localStorage.removeItem("characterCreationInventory");
				}, 100);

				setFlag("cutscene.characterCreation");
				navigate("/");
			}}
			dialog={makeDialog([
				{
					enterFunction: () => {
						setModifiers("base", [
							createModifierRef("equippedArmorsAC", {}),
							createModifierRef("equippedShieldAC", {}),
							createModifierRef("classHitPoints", {}),
							createModifierRef("baseAttacksPerAction", { value: 1 }),
							createModifierRef("baseMaxHitDice", {}),
						]);
					},
					text: (
						<>
							<h2 class="text-center">Welcome to the lands of {COUNTRY_NAME}</h2>
							<p>
								You will now create a character. Think about the kind of adventurer you want to play. You might be a courageous
								fighter, a skulking rogue, a fervent cleric, or a flamboyant wizard. Or you might be more interested in an
								unconventional character, such as a brave rogue who likes hand-to-hand combat, or a sharpshooter who picks off
								enemies from afar.
							</p>{" "}
							<br />
							<p>Well...for now, you can only play a fighter with no associated species of background (but it's coming)</p>
						</>
					),
				},
				statPage({ setModifiers }),
				skillsPage({ setModifiers }),
				startingEquipmentPage({ setInventory }),
				{
					choices: [{ effect: props => props.setNext(-1), text: "Back" }, { text: "Continue" }],
					enterFunction: () => {
						setPlayer("inventory", Object.values(inventory).flat());
					},
					id: "equipment",
					text: (
						<div class="not-prose">
							<h3 class="mb-5">Equip what you need</h3>
							<Equipment
								inventory={player.inventory}
								setInventory={(...args: any[]) => (setPlayer as any)("inventory", ...args)}
							/>
						</div>
					),
				},
				abilitiesPage({ setAbilities }),
				{
					choices: [{ effect: props => props.setNext(-1), text: "Back" }, { text: "Continue" }],
					text: <p>You can now start your journey.</p>,
				},
			])}
		/>
	);
}
