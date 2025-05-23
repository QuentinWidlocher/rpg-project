import { useNavigate } from "@solidjs/router";
import { isNull } from "lodash-es";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { longRest } from "~/game/character/character";
import { getClassLabel } from "~/game/character/classes/classes";
import { SkillCheck } from "~/game/dialog/checks";
import { Choice, skillCheckChoice, skillCheckConditionChoice } from "~/game/dialog/choices";
import { makeDialog } from "~/game/dialog/dialog";
import { innkeeperInfos, setDefaultInnDialogConfig } from "~/routes/inn/_config";
import { cc, formatCc, gc } from "~/utils/currency";

type State = {
	cost: number;
	discount: number | null;
	awareYouLostMoney: boolean;
	calledYourBluff: boolean;
	updatedPlayerOnce: boolean;
};

export default function InnDeathDialog() {
	const navigate = useNavigate();
	const { getFlag } = useFlags();
	const { player, setPlayer } = usePlayer();

	const youLost = cc(5 + Math.floor(Math.random() * 15));

	const payChoices = [
		{
			condition: props =>
				player.money >= props.state.cost ? true : { success: false, tooltip: "Not enough gold to pay" },
			effect: props => {
				setPlayer("money", prev => prev - props.state.cost);
				props.setNext("youPaid");
			},
			text: props => `Here you go (- ${formatCc(props.state.cost, { exhaustive: true, style: "short" })})`,
		},
		skillCheckChoice(player, "deception", 15, {
			condition: props => player.money >= props.state.cost && !props.state.calledYourBluff,
			effect: props => props.setNext("wontPay"),
			failure: props => props.setState("calledYourBluff", true),
			success: props => props.setState("calledYourBluff", false),
			text: "I'm sorry I don't have that much",
		}),
		{
			condition: props => player.money < props.state.cost,
			effect: props => props.setNext("wontPay"),
			text: `I'm sorry I don't have that much`,
		},
		skillCheckChoice(player, "persuasion", 15, {
			condition: props => isNull(props.state.discount),
			failure: props => {
				props.setState("discount", 0);
				props.setNext("noDiscount");
			},
			success: props => {
				const discount = props.state.awareYouLostMoney ? 0.5 : 0.3;
				props.setState("cost", prev => Math.round(prev * discount));
				props.setState("discount", discount);
				props.setNext("discount");
			},
			text: "Could you give me a discount please ?",
		}),
	] satisfies Array<Choice<State>>;

	return (
		<DialogComponent<State>
			initialState={{
				awareYouLostMoney: false,
				calledYourBluff: false,
				cost: gc(1),
				discount: null,
				updatedPlayerOnce: false,
			}}
			onDialogStop={() => navigate("/town")}
			setupFunction={setDefaultInnDialogConfig}
			dialog={makeDialog([
				{
					choices: [
						{
							text: "Thank you",
						},
						{
							text: "How much do I owe you ?",
						},
					],
					enterFunction: props => {
						if (!props.state.updatedPlayerOnce) {
							setPlayer("money", prev => prev - youLost);
							longRest({ set: setPlayer, value: player });
							props.setState("updatedPlayerOnce", true);
						}
					},
					text: (
						<>
							<blockquote>Hey there, are you alright... ? You've been for hours...</blockquote>
							<p>The innkeeper is looking over you. It seems you're in a bedroom inside the inn.</p>
							<blockquote>
								What happened ? Someone brought you here, inconcious, did you have a fight with an ogre or what ?
							</blockquote>
						</>
					),
					title: () => (getFlag("npc.inn.gotName") ? innkeeperInfos.firstName : "Innkeeper"),
				},
				{
					choices: [
						skillCheckConditionChoice(player, "perception", 10, {
							effect: props => props.setNext("realizeYouLostMoney"),
							text: "Hey, where is my money ?",
						}),
						...payChoices,
					],
					text: props => (
						<>
							<blockquote>
								As much as you needed the rest, it's true that the guy didn't pay for the room for you so...
							</blockquote>
							<SkillCheck character={player} dd={12} skill={"insight"}>
								<p>
									He looks slightly unconfortable asking a passed out {getClassLabel(player.class).toLowerCase()} for money.
								</p>
							</SkillCheck>
							<blockquote>
								I guess {formatCc(props.state.cost, { exhaustive: true, style: "long" })} would do. Of course you can stay here,
								wash yourself and have a meal downstairs when you're ready.
							</blockquote>
						</>
					),
				},
				{
					choices: [...payChoices],
					enterFunction: props => props.setState("awareYouLostMoney", true),
					id: "realizeYouLostMoney",
					text: () => (
						<>
							<p>
								You pat your pockets and realize that a small purse you always keep is missing. (you lost{" "}
								{formatCc(youLost, { exhaustive: true, style: "long" })})
							</p>
							<blockquote>Damn, that guy must've taken his toll, I'm sorry to hear that...</blockquote>
							<SkillCheck character={player} dd={12} skill={"insight"}>
								<p>He's embarassed, he don't want to take too much from you.</p>
							</SkillCheck>
						</>
					),
				},
				{
					choices: [...payChoices],
					id: "discount",
					text: props => (
						<>
							<blockquote>
								Sure, I understand. <br />
								{props.state.awareYouLostMoney ? (
									<>
										Since you already lost some money, it's the least I can do. <br />
									</>
								) : (
									""
								)}
								What about {formatCc(props.state.cost, { exhaustive: true, style: "long" })} then ?
							</blockquote>
						</>
					),
				},
				{
					choices: [...payChoices],
					id: "noDiscount",
					text: props => (
						<>
							<blockquote>
								No sorry... I need the money too, times are hard for everyone. <br />
								{props.state.awareYouLostMoney ? (
									<>
										I know you lost some of your gold, but I can't just lower my prices for anyone.
										<br />
									</>
								) : (
									""
								)}
								I just need {formatCc(props.state.cost, { exhaustive: true, style: "long" })} ok ?
							</blockquote>
						</>
					),
				},
				{
					choices: props => (props.state.calledYourBluff ? [...payChoices] : []),
					exitFunction: props => props.setNext("end"),
					id: "wontPay",
					text: props => (
						<>
							{props.state.calledYourBluff ? (
								<blockquote>
									Look, I know you have the money, please don't make a scene. Surely you understand that you owe me for this
									right ?
								</blockquote>
							) : (
								<blockquote>
									Alright then, if you really can't pay me, what can I do right ? I hope the next time I see you, you'll pay me.
								</blockquote>
							)}
						</>
					),
				},
				{
					enterFunction: props => setPlayer("money", prev => prev - props.state.cost),
					id: "youPaid",
					text: (
						<>
							<blockquote>Thanks, I hope the next time I see you, it'll be in a better situation.</blockquote>
							<p>He laugh.</p>
						</>
					),
				},
				{
					id: "end",
					text: (
						<>
							<p>You leave the inn.</p>
						</>
					),
				},
			])}
		/>
	);
}
