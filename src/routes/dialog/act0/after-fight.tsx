import { useLocation, useNavigate } from "@solidjs/router";
import { sample } from "lodash-es";
import { act0Opponent } from "./_config";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { CITY_NAME } from "~/constants";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { SkillCheck } from "~/game/dialog/checks";
import { goTo, skillCheckChoice } from "~/game/dialog/choices";
import { makeDialog } from "~/game/dialog/dialog";
import { opponentTemplates } from "~/game/opponents/monsters";
import { formatCc, sc } from "~/utils/currency";
import { Item } from "~/game/items/items";

export default function Act0AfterFight() {
	const location = useLocation<{ victorious: boolean }>();
	const { setFlag } = useFlags();
	const navigate = useNavigate();

	setFlag("act0.defeatedTheBandit", location.state?.victorious);

	function afterDialog() {
		setFlag("cutscene.act0");
		navigate("/town");
	}

	// If the dialog branches are very different and exist in separate flows, we can branch before the Dialog like this
	if (location.state?.victorious) {
		return <Victory then={afterDialog} />;
	} else {
		return <Defeat then={afterDialog} />;
	}
}

function Victory(props: { then: () => void }) {
	const opponentName = opponentTemplates[act0Opponent].name.toLowerCase();
	const { player, setPlayer } = usePlayer();

	const equippedWeapon = () =>
		player.inventory.find(i => i.type == "weapon" && i.equipped)?.name.toLowerCase() ?? "sword";

	const opponentGold = sc(1 + Math.floor(Math.random() * 3));
	const oldManGold = sc(5 + Math.floor(Math.random() * 10));

	return (
		<DialogComponent
			onDialogStop={props.then}
			dialog={makeDialog([
				{
					choices: [
						{
							effect: goTo("slit-their-throat"),
							text: "Slit their throat",
						},
						{ text: "Listen to what they say" },
					],
					text: (
						<>
							<span>
								The {opponentName} fell to the ground, you bring your {equippedWeapon()} to their neck before they can get back
								to their feet..
							</span>{" "}
							<br /> <br />
							<blockquote>Wait ! Wait !! I'm so sorry, don't kill me please !</blockquote> <br /> <br />
						</>
					),
					title: "Victorious",
				},
				{
					choices: [
						{ effect: goTo("getting-the-cart-up"), text: "Help them get the old man cart back on four wheels" },
						skillCheckChoice(player, "intimidation", 13, {
							failure: goTo("asked-their-money-fail"),
							success: goTo("asked-their-money-success"),
							text: "Ask for their money too",
						}),
						skillCheckChoice(player, ["intimidation", "persuasion"], 10, {
							effect: goTo("asked-to-stop"),
							text: "Ask them to abandon their way",
						}),
					],
					text: (
						<>
							<span>They wait for a second to see if you're moving. You're not.</span> <br />
							<span>They seem a bit relieved and continue to talk</span> <br />
							<br />
							<blockquote>
								I'm so sorry, I will give the old man his things back, I'll help them get back on the road I{" "}
								<strong>swear</strong> ! <br />
							</blockquote>
						</>
					),
				},
				{
					exitFunction: goTo("getting-the-cart-up"),
					id: "asked-their-money-fail",
					text: (
						<>
							<blockquote>You want... what ? No, I'm the bandit here, I have no coins to my name you know ?</blockquote> <br />
							<SkillCheck character={player} skill="insight" dd={10}>
								They're right, they don't have anything.
							</SkillCheck>
						</>
					),
				},
				{
					enterFunction: () => setPlayer("money", prev => prev + opponentGold),
					exitFunction: goTo("getting-the-cart-up"),
					id: "asked-their-money-success",
					text: (
						<>
							<blockquote>
								You want... what ? Ok ok sorry here you are, take everything please just... don't hurt me ok ?
							</blockquote>{" "}
							<br />
							<br />
							<span>Their voice cracks, they empty their purse and give you some coins</span>
							<pre>You got {formatCc(opponentGold, { exhaustive: true, style: "long" })}</pre>
						</>
					),
				},
				{
					id: "asked-to-stop",
					text: (
						<>
							<blockquote>Erm, yeah ! Okay okay, you're right, I need to turn my life over and rethink my choices.</blockquote>{" "}
							<br />
							<br />
							<SkillCheck character={player} skill="insight" dd={10}>
								Obviously, they're just saying this so you don't cut their throat.
							</SkillCheck>
						</>
					),
				},
				{
					enterFunction: () => setPlayer("money", prev => prev + oldManGold),
					exitFunction: goTo("opponent-is-gone"),
					id: "getting-the-cart-up",
					text: (
						<>
							<span>The {opponentName} reluctantly helps you to lift the cart back to its wheels.</span> <br /> <br />
							<span>The old man look at you both, a bit confused but glad.</span> <br /> <br />
							<blockquote>
								Thank you for your help, this filthy <em>thug</em> gave me a scare, you saved me ! <br />
								Here, take some coins for your trouble.
							</blockquote>
							<span>
								He opens a crate in his cart, struggle to find something at the very bottom and get a purse out.
							</span>{" "}
							<br /> <br />
							<pre>You got {formatCc(oldManGold, { exhaustive: true, style: "long" })}</pre>
						</>
					),
				},
				{
					exitFunction: props => props.setNext("opponent-is-gone"),
					id: "slit-their-throat",
					text: (
						<>
							<span>Before they could say anything more, the blade of your {equippedWeapon()} slit their throat open.</span>{" "}
							<br />
							<span>
								As the {opponentName} convulses on the floor, the horrified old man stand there, waiting for your next move.
							</span>
						</>
					),
				},
				{
					id: "opponent-is-gone",
					text: (
						<>
							<span>With this threat gone, you got back on track and continue to make your way to {CITY_NAME}.</span> <br />
							<span>The rest of your journey is uneventful and you reach the city an hour or so before sundown.</span>
						</>
					),
				},
			])}
		/>
	);
}

function Defeat(props: { then: () => void }) {
	const opponentName = opponentTemplates[act0Opponent].name.toLowerCase();
	const { player, setPlayer } = usePlayer();

	return (
		<DialogComponent<{ removedItem?: Item }>
			initialState={{ removedItem: sample(player.inventory) }}
			onDialogStop={props.then}
			dialog={makeDialog([
				{
					enterFunction: props => {
						if (!props.state.removedItem) {
							props.continue();
						} else {
							setPlayer("inventory", inventory => inventory.filter(i => i.id != props.state.removedItem!.id));
						}
					},
					text: props => (
						<>
							<span>You lie on the ground, inconcious, as the {opponentName} starts to strip you from you belongings. </span>{" "}
							<br />
							<br />
							<em>
								The {opponentName} took your {props.state.removedItem!.name}
							</em>
						</>
					),
					title: "Harsh return to reality",
				},
				{
					enterFunction: () => {
						setPlayer("hp", "current", 1);
					},
					text: (
						<>
							<span>
								You emerge some time later. The sun is already low on the horizon and the {opponentName} is nowhere to be found.
							</span>{" "}
							<br />
							<span>The old man lies in a puddle of blood, the cart is empty.</span>
							<br /> <br />
							<span>You press forward and manage to reach {CITY_NAME} right before the night falls.</span>
						</>
					),
				},
			])}
		/>
	);
}
