import { useNavigate } from "@solidjs/router";
import { shopkeeperInfos } from "../dialog/shop";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { Scene, makeDialog } from "~/game/dialog/dialog";
import { FlagName, useFlags } from "~/contexts/flags";
import { usePlayerStore } from "~/contexts/player";
import { longRest } from "~/game/character/character";
import { Choice } from "~/game/dialog/choices";
import { formatCc, sc } from "~/utils/currency";

function getLatestRumor({ getFlag, setFlag }: Pick<ReturnType<typeof useFlags>, "getFlag" | "setFlag">) {
	function getAndSetIfNotAlready(flag: FlagName) {
		const flagIsSet = getFlag(flag);
		console.debug("flagIsSet", flagIsSet);
		if (!flagIsSet) {
			setFlag(flag);
			return true;
		} else {
			return false;
		}
	}

	if (getAndSetIfNotAlready("act1.innKeeperToldAboutTheCriminal")) {
		return "A criminal have been seen in the arena. Be careful if you're going there. Wait, I think I have his wanted poster here ... Here! Here it is.";
	}
	return "Nope, nothing to share with you, sorry.";
}

export default function Inn() {
	const navigate = useNavigate();
	const { getFlag, setFlag } = useFlags();
	const player = usePlayerStore();

	const cost = sc(5);

	const setDefaultInnDialogConfig = (props => {
		props.setIllustration({
			background: "/backgrounds/inn.webp",
			character: "/characters/innkeeper.png",
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
		<DialogComponent<{
			lastRumor: string;
		}>
			initialState={{ lastRumor: "" }}
			onDialogStop={() => navigate("/town")}
			setupFunction={setDefaultInnDialogConfig}
			dialog={makeDialog([
				{
					choices: [
						{
							effect: props => props.setNext("job"),
							text: () => "I'm looking for a job",
						},
						{
							effect: props => props.setNext("rumors"),
							text: () => "Heard any rumors ?",
						},
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
					id: "first-encounter",
					text: () => (
						<>
							<p>
								The inn is a spacious building on two floors, well lit. At any time of the day or night, we come across
								merchants, diplomats, adventurers, artists, people of the peoples in search of sensations, as well as the
								occasional criminal...
							</p>
							<blockquote>Hello there ! What can I do for you ?</blockquote>

							<p>A large human greets you from all the way behind the counter. He looks tired.</p>
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
					exitFunction: props => props.setNext("first-encounter"),
					id: "job",
					text: <>Sorry, I'm not looking for anyone right now.</>,
				},
				{
					enterFunction: props => props.setState("lastRumor", getLatestRumor({ getFlag, setFlag })),
					exitFunction: props => props.setNext("first-encounter"),
					id: "rumors",
					text: props => <p>{props.state.lastRumor}</p>,
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
