import { useNavigate } from "@solidjs/router";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { useFlags } from "~/contexts/flags";
import { skillCheck, usePlayer } from "~/contexts/player";
import { makeDialog } from "~/game/dialog/dialog";
import { opponentTemplates } from "~/game/opponents/monsters";
import { act0Opponent } from "./_config";
import { effect } from "solid-js/web";
import { skillCheckChoice } from "~/game/dialog/choices";

export default function Dialog() {
	const { setFlag } = useFlags();
	const navigate = useNavigate();
	const { player } = usePlayer();

	// @FIXME debug
	const playerIsFighter = () => false; // player.class == 'fighter';

	const equippedWeapon = () =>
		player.inventory.find(i => i.type == "weapon" && i.equipped)?.name.toLowerCase() ?? "sword";

	const opponentName = opponentTemplates[act0Opponent].name.toLowerCase();

	return (
		<DialogComponent
			dialog={makeDialog([
				{
					text: () => (
						<>
							You are walking south for month now, towards the city of Lakespire. <br />
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
						!playerIsFighter()
							? skillCheckChoice(player, "stealth", 15, {
									text: () => `Sneak toward the ${opponentName} and attack`,
									effect: () => {
										navigate("fight", { state: { sneakAttack: true } });
									},
								})
							: undefined,
						{
							text: () => `Attack the ${opponentName}`,
							effect: () => navigate("fight"),
						},
						!playerIsFighter()
							? skillCheckChoice(player, "stealth", 7, {
									text: () => "Run away while you're still undetected",
									effect: props => (skillCheck(player, "stealth", 10) ? props.setNext("got-away") : props.setNext("detected")),
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
					exitFunction: () => navigate("fight", { state: { detected: true } }),
				},
				{
					id: "got-away",
					text: () => (
						<>
							Taking your courage in both hands, you quietly walk back and returns to the road, where you continue your journey
							south to Lakespire
						</>
					),
				},
			])}
		/>
	);
}
