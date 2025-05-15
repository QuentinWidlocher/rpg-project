import { useNavigate } from "@solidjs/router";
import { abilitiesPage } from "../character-creation/_abilities";
import { AbilityDisplay } from "~/components/AbilityDisplay";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { IconoirPlus } from "~/components/icons/Plus";
import { Equipment } from "~/components/inventory/Equipment";
import { useBookmark } from "~/contexts/bookmark";
import { useDebug } from "~/contexts/debug";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { ActionRefKey, actions, createActionRef } from "~/game/character/actions";
import { BaseSkill, Skill, getMaxHp, getSkillLabel } from "~/game/character/character";
import { classConfigs } from "~/game/character/classes/classes";
import { fightingStyles } from "~/game/character/classes/fighter/modifiers";
import { upgradesByClassByLevel } from "~/game/character/classes/upgrades";
import { isWeaponItem } from "~/game/character/guards";
import { ModifierRef, createModifierRef } from "~/game/character/modifiers";
import { makeDialog } from "~/game/dialog/dialog";
import { ItemId, createItem, items } from "~/game/items/items";
import { stringifyDice } from "~/utils/dice";

export default function IntroDialog() {
	const navigate = useNavigate();
	const { debug } = useDebug();
	const { player, setPlayer } = usePlayer();
	const { getFlag, setFlag } = useFlags();
	const { clearBookmark } = useBookmark();

	if (getFlag("cutscene.characterCreation")) {
		clearBookmark();
		navigate("/");
	}

	return (
		<DialogComponent<{
			baseSkillValues: Record<BaseSkill, number>;
			choices: any[][][]; // @FIXME
			equipment: (null | ItemId)[][];
			selectedFightingStyle: keyof typeof fightingStyles | null;
			selectedSkills: [Skill | null, Skill | null];
			selectedChoices: any[]; // @FIXME
			modifiers: ModifierRef[];
		}>
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
				setFlag("cutscene.characterCreation");
				navigate("/");
			}}
			dialog={makeDialog([
				{
					text: "Well, time to begin your journey !",
				},
			])}
		/>
	);
}
