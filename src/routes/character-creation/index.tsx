import { useNavigate } from "@solidjs/router";
import { createSignal, getOwner } from "solid-js";
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
import { useI18n } from "~/contexts/i18";

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
	const { t, T } = useI18n();
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
	const owner = getOwner()!;

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
							<h2 class="text-center">{t("characterCreation.welcome.title", { countryName: COUNTRY_NAME })}</h2>
							<p>{t("characterCreation.welcome.paragraph1")}</p>
							<br />
							<p>{t("characterCreation.welcome.paragraph2")}</p>
						</>
					),
				},
				statPage({ owner, setModifiers }),
				skillsPage({ owner, setModifiers }),
				startingEquipmentPage({ owner, setInventory }),
				{
					choices: [{ effect: props => props.setNext(-1), text: t("dialog.back") }, { text: t("dialog.continue") }],
					enterFunction: () => {
						setPlayer("inventory", Object.values(inventory).flat());
					},
					id: "equipment",
					text: (
						<div class="not-prose">
							<h3 class="mb-5">{t("characterCreation.equipment.title")}</h3>
							<Equipment
								inventory={player.inventory}
								setInventory={(...args: any[]) => (setPlayer as any)("inventory", ...args)}
							/>
						</div>
					),
				},
				abilitiesPage({ owner, setAbilities }),
				{
					choices: [{ effect: props => props.setNext(-1), text: t("dialog.back") }, { text: t("dialog.continue") }],
					text: <p>{t("characterCreation.conclusion.paragraph1")}</p>,
				},
			])}
		/>
	);
}
