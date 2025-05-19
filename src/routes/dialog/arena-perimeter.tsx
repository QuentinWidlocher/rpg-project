import { useNavigate } from "@solidjs/router";
import { Act1FightState } from "./act1/arena-perimeter-fight";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { Choice, skillCheckChoice } from "~/game/dialog/choices";
import { makeDialog } from "~/game/dialog/dialog";

const ARENA_FIGHT_ROUTE = "/dialog/act1/arena-perimeter-fight";
const TOWN_MENU_ROUTE = "/town";
const ARENA_ROUTE = "/arena";

type State = {
	criminalDisarmed: boolean;
};

export default function ArenaDialog() {
	const navigate = useNavigate();
	const { player } = usePlayer(); // Get player data from context
	const { getFlag } = useFlags();

	const goToFight = (state?: Act1FightState) => navigate(ARENA_FIGHT_ROUTE, { state });

	const displayAct1 = getFlag("act1.innKeeperToldAboutTheCriminal") && !getFlag("act1.defeatedTheCriminal");

	return (
		<DialogComponent<State>
			initialState={{
				criminalDisarmed: false,
			}}
			dialog={makeDialog([
				// --- Step 0: Arena Description (if plot not active) ---
				{
					choices: [
						...(displayAct1
							? ([
									skillCheckChoice(player, "stealth", 13, {
										failure: dialogProps => dialogProps.setNext("challengeHimDirectly"),
										success: dialogProps => dialogProps.setNext("approachSuccess"),
										text: "Approach discreetly.", // If stealth fails, it's like being spotted
									}),
									{
										effect: props => props.setNext("challengeHimDirectly"),
										text: "Challenge him directly.",
									},
							  ] as Choice<State>[])
							: []),
						{ effect: () => navigate(ARENA_ROUTE), text: "Enter the arena." },
						{ effect: () => navigate(TOWN_MENU_ROUTE), text: "Leave." },
					],
					id: "arenaDescription",
					text: () => (
						<>
							<p>
								Lakespire is famous for its arena! It's in the middle of this semi-circle of stands, shaded by colorful
								canvases, that the best fighters from the surrounding towns clash.
							</p>
							{displayAct1 && (
								<p class="text-base alert alert-soft">
									As you walk in the shade of the columns that mark the arena's enclosure, you notice the individual mentioned by
									the innkeeper and recognize their portrait.
								</p>
							)}
						</>
					),
					title: "Lakespire Arena",
				},
				// --- Step 2a: Stealth Success ---
				{
					choices: [
						{
							effect: () => goToFight({ surpriseAttack: true }),
							text: "Attack him with surprise.",
						},
						{
							effect: dialogProps => dialogProps.setNext("challengeHimDirectly"),
							text: "Speak to him.", // Being close and speaking is like challenging
						},
					],
					id: "approachSuccess",
					text: () => <>You are close enough to smell the alcohol on the criminal. You could take him by surprise.</>,
				},
				// --- Step 2b or Failure of Stealth: Challenging Him ---
				{
					choices: [
						{
							effect: props => props.setNext("criminalCaughtUp"),
							text: "Run after him.",
						},
						{
							effect: props => props.setNext("criminalFlee"),
							text: "Let him go.",
						},
					],
					id: "challengeHimDirectly",
					text: () => <>Seeing your gaze meet his, the criminal tries to flee before you can even say a word.</>,
				},
				{
					exitFunction: () => navigate(TOWN_MENU_ROUTE),
					id: "criminalFlee",
					text: <>The criminal disappears between the city's stalls</>,
				},
				// --- Step 3: Criminal Caught Up ---
				{
					choices: [
						skillCheckChoice(player, "persuasion", 10, {
							failure: () => navigate(ARENA_FIGHT_ROUTE),
							success: dialogProps => dialogProps.setNext("persuadeSurrenderInitialSuccess"),
							text: "Urge him to surrender.", // Failed persuasion leads to combat
						}),
						{
							effect: () => navigate(ARENA_FIGHT_ROUTE),
							text: "Attack him.",
						},
						{
							effect: () => navigate(TOWN_MENU_ROUTE),
							text: "Flee.",
						},
					],
					id: "criminalCaughtUp",
					text: () => <>The wanted man turns sharply, a dagger in his hand.</>,
				},
				// --- Step 4: Initial Persuasion Success (DD10) ---
				{
					choices: [
						skillCheckChoice(player, "persuasion", 13, {
							failure: () => navigate(ARENA_FIGHT_ROUTE),
							success: props => {
								props.setState("criminalDisarmed", true);
								props.setNext("persuadeDisarmSuccess");
							},
							text: "Tell him you can plead his case if he puts down his weapon immediately.",
						}),
						{
							effect: () => navigate(ARENA_FIGHT_ROUTE),
							text: "Finally... attack him.",
						},
					],
					id: "persuadeSurrenderInitialSuccess",
					text: () => <>The man listens to you, his eyes filled with a mix of fear and anger.</>,
				},
				// --- Step 5: Disarm Persuasion Success ---
				{
					choices: [
						skillCheckChoice(player, "persuasion", 20, {
							failure: () => goToFight({ criminalWasDisarmed: true }),
							success: dialogProps => dialogProps.setNext("surrenderSequence"),
							text: "Mention the castle, where he can receive a fair judgment.",
						}),
						skillCheckChoice(player, "persuasion", 15, {
							failure: () => goToFight({ criminalWasDisarmed: true }),
							success: dialogProps => dialogProps.setNext("surrenderSequence"),
							text: "Talk about his loved ones, his family, the foolish thing he's doing.",
						}),
						skillCheckChoice(player, "persuasion", 13, {
							// Leads to combat
							failure: () => goToFight({ criminalWasDisarmed: true }),
							success: () => goToFight({ criminalWasDisarmed: true }),
							text: "Mention the arena, where one can make a name by facing formidable opponents.",
						}),
						{
							effect: () => navigate(ARENA_FIGHT_ROUTE),
							text: "Mention the city's shops, where everyone can find happiness and work.",
						},
					],
					id: "persuadeDisarmSuccess",
					text: () => (
						<>
							The criminal slowly puts down his dagger, never taking his eyes off you, while trying to draw as little attention
							as possible. He is disarmed.
						</>
					),
				},
				// --- Step 6: Surrender Sequence (The Twist!) ---
				{
					choices: [
						{
							effect: props =>
								navigate(ARENA_FIGHT_ROUTE, {
									state: { criminalWasDisarmed: props.state.criminalDisarmed },
								}),
							text: "Defend yourself!",
						},
					],
					id: "surrenderSequence",
					text: () => (
						<>
							The criminal holds out his wrists as if you have something to tie him up. His violent demeanor seems to have
							completely vanished, evaporated by the hope of being able to change his life.
							<br />
							<br />
							Nearby, a shout erupts: "He's there!"
							<br />
							<br />
							Then, the bandit suddenly attacks you, as if seized by a fit of madness!
						</>
					),
				},
			])}
		/>
	);
}
