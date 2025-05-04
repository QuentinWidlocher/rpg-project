import { useNavigate } from "@solidjs/router";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { skillCheck, usePlayer } from "~/contexts/player";
import { makeDialog } from "~/game/dialog/dialog";
import { opponentTemplates } from "~/game/opponents/monsters";
import { act0Opponent } from "./_config";
import { getSkillCheckCondition, skillCheckChoice, skillCheckConditionChoice } from "~/game/dialog/choices";
import { CITY_NAME } from "~/constants";

export default function Act0BeforeFight() {
	const navigate = useNavigate();
	const { player } = usePlayer();

	// @FIXME for debug purpose only
	const playerIsFighter = () => false; // player.class == 'fighter';

	const equippedWeapon = () =>
		player.inventory.find(i => i.type == "weapon" && i.equipped)?.name.toLowerCase() ?? "sword";

	// Here we get the opponent from the config of the act, a simple way to swap some data
	const opponentName = opponentTemplates[act0Opponent].name.toLowerCase();

	return (
		<DialogComponent
			dialog={makeDialog([
				{
					title: "On the road",
					text: () => (
						<>
							You are walking south for month now, towards the city of {CITY_NAME}. <br />
							<br />
							All the days look the same on this sunny road that stretch from the north, way up the montains, to the very south
							of the continent. <br />
							Your mind in wandering off, as it always does when you walk for long times. <br />
							<br />
							<blockquote>
								<b>HELP ! HEEELP !!</b>
							</blockquote>
							<br />
							{
								// Easiest way to make a strict mapper to ensure every class has their own text.
								// (it could be a function to have a default or to share texts between classes though)
								{
									fighter: (
										<>
											Jolting awake from your thoughts to the sudden screams, you draw your {equippedWeapon()} and runs toward the
											source of the noise.
										</>
									),
									wizard: (
										<>
											Still deep in your toughts, you take some time to process the sudden screams. You cautiously make your way
											toward the source of the noise.
										</>
									),
									rogue: (
										<>
											You stop playing with your {equippedWeapon()} and sneakily make your way toward the source of the noise,
											making sure to remain undetected.
										</>
									),
								}[player.class]
							}
						</>
					),
					choices: [{ text: "Continuer" }],
				},
				{
					text: () => (
						<>
							Now that you're close enough to see what is happening, you can distinguish the shapes of a {opponentName},
							threatening a poor old man. <br />
							<br />
							Behind them, a wooden cart is laying on its side and looks full of crates and bags.
							<br />
							{playerIsFighter() && (
								<>The {opponentName} turns around and screams at you. The old man screams for you to help him.</>
							)}
						</>
					),
					choices: [
						// Here we completely prevent choices to exist by returning `undefined`
						!playerIsFighter()
							? // But the choice itself is conditional and only appear when a skill check is successfull
							  skillCheckChoice(player, "stealth", 15, {
									text: `Sneak toward the ${opponentName} and attack`,
									// We leverage the navigation state to pass dialog outcome to fights
									success: () => navigate("../fight", { state: { sneakAttack: true } }),
									failure: () => navigate("../fight", { state: { sneakAttack: false } }),
							  })
							: undefined,
						{
							text: `Attack the ${opponentName}`,
							effect: () => navigate("../fight"),
						},
						// This choice is also conditional but it appears event if the skill check fails (for fighters only obv.)
						!playerIsFighter()
							? // When selected, the choice will need a dd10 stealth check to redirect
							  skillCheckChoice(player, "stealth", 10, {
									success: props => props.setNext("got-away"),
									failure: props => props.setNext("detected"),
									text: "Run away while you're still undetected",
									// but the choice also need a dd7 stealth check to even be available
									condition: () => getSkillCheckCondition(player, "stealth", 7),
									visibleOnFail: true,
							  })
							: undefined,
					],
				},
				{
					id: "detected",
					text: () => (
						<>
							Taking your courage in both hands, you quietly walk back. <br />
							<br />
							<i>*snap*</i>
							<br />
							<br />A branch broke under your right foot, the {opponentName} turns to you and before it can even say something,
							you feel another one right behind you, ready to attack.
						</>
					),
					// Here we want to keep the default choice but add an effect
					exitFunction: () => navigate("../fight", { state: { detected: true } }),
				},
				{
					id: "got-away",
					text: () => (
						<>
							Taking your courage in both hands, you quietly walk back and returns to the road, where you continue your journey
							south to {CITY_NAME}
						</>
					),
					exitFunction: () => navigate("/town"),
				},
			])}
		/>
	);
}
