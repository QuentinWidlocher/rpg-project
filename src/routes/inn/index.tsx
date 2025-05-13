import { useNavigate } from "@solidjs/router";
import { shopkeeperInfos } from "../dialog/shop";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { Scene, makeDialog } from "~/game/dialog/dialog";
import { useFlags } from "~/contexts/flags";
import { usePlayerStore } from "~/contexts/player";
import { longRest } from "~/game/character/character";
import { Choice } from "~/game/dialog/choices";
import { formatCc, sc } from "~/utils/currency";

export default function Inn() {
	const navigate = useNavigate();
	const { getFlag, setFlag } = useFlags();
	const player = usePlayerStore();

	const cost = sc(5);

	const setDefaultInnDialogConfig = (props => {
		props.setIllustration({
			background: "/backgrounds/inn.png",
			character: "/characters/innkeeper.webp",
		});
	}) satisfies Scene<any>["enterFunction"];

	const restChoice = {
		condition: () => (player.value.money >= cost ? true : { success: false, tooltip: "You don't have enough money." }),
		effect: () => {
			setFlag("npc.inn.restedOnce");

			player.set("money", prev => prev - cost);

			longRest(player);
			alert("You feel well rested.");
			navigate("/town");
		},
		text: `I'll take a room for tonight (-${formatCc(cost, { style: "short" })}, rest until tomorrow)`,
		visibleOnFail: true,
	} satisfies Choice<any>;

	return (
		<DialogComponent
			key="inn"
			onDialogStop={() => navigate("/town")}
			dialog={makeDialog([
				{
					choices: [
						getFlag("npc.inn.restedOnce") == true ? restChoice : undefined,
						{
							condition: () => getFlag("npc.inn.restedOnce") == false,
							effect: props => props.setNext("room"),
							text: () => "How much for a room ?",
						},
						{
							effect: props => props.setNext("goodbye"),
							text: () => "Nothing, I was just visiting",
						},
					],
					enterFunction: setDefaultInnDialogConfig,
					id: "first-encounter",
					text: () => (
						<>
							<blockquote>Hello there ! What can I do for you ?</blockquote>

							<p>A large human greets you from all the way behind the counter. He looks tired but jovial.</p>
						</>
					),
					title: () => (getFlag("npc.inn.gotName") ? shopkeeperInfos.firstName : "Innkeeper"),
				},
				{
					choices: [
						restChoice,
						{
							effect: props => props.setNext("goodbye"),
							text: () => "No sorry, I'll go now",
						},
					],
					id: "room",
					text: () => (
						<>
							<blockquote>Only {formatCc(cost)} for the night, interested ?</blockquote>
						</>
					),
				},
				{
					id: "goodbye",
					text: () => (
						<>
							<blockquote>Alright then, take care !</blockquote>
						</>
					),
				},
			])}
		/>
	);
}
