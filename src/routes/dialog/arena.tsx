import { useNavigate } from "@solidjs/router";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { skillCheckConditionChoice } from "~/game/dialog/choices";
import { makeDialog } from "~/game/dialog/dialog";

export default function ArenaDialog() {
	const navigate = useNavigate();

	const { player } = usePlayer();
	const { setFlag } = useFlags();

	return (
		<DialogComponent<{ enthusiast: boolean }>
			key="arena"
			initialState={{ enthusiast: false }}
			setupFunction={() => {}}
			dialog={makeDialog([
				{
					choices: [
						{ text: "Approach the man" },
						{
							condition: () => player.class == "fighter",
							effect: props => props.setState("enthusiast", true),
							text: 'Shout "YES" and draw your sword',
						},
						{
							effect: () => navigate("/town"),
							text: "Ignore him and walk away",
						},
					],
					text: () => (
						<>
							When you arrive at the bottom of this large building, you hear a man shouting at the entrance. <br />
							<blockquote>
								COOOOME TRY YOUR LUCK IN THE ARENAAAAA ! <br />
								ARE YOU BRAVE ENOUGH TO FIGHT AND SEE ANOTHER DAY ?!
							</blockquote>
							He notices you and point his finger at you.
							<blockquote>YOU ! HAVE YOU COME TO SHOW THE WORLD WHAT YOU'RE CAPABLE OF ??</blockquote>
						</>
					),
					title: "Arena",
				},
				{
					choices: [
						{
							effect: props => props.setNext("last"),
							text: "Sign up to fight in the arena",
						},
						{ text: "Ask how this works" },
					],
					text: props => (
						<>
							{props.state.enthusiast ? (
								<blockquote>
									THAT'S WHAT I WANT TO HEAR ! <br />
								</blockquote>
							) : null}
							<blockquote>COME ! SIGN THIS FORM AND YOU'LL GET GLORY AND RICHES !</blockquote> <br />
							His screams are hurting your ears.
						</>
					),
				},
				{
					choices: [
						{
							effect: props => props.setNext("last"),
							text: "Sign up to fight in the arena",
						},
						{ text: '"Hold up, are theses death matchs ?"' },
					],
					text: () => (
						<>
							<blockquote>
								IT'S SIMPLE. YOU GO INSIDE THE ARENA. YOU FIGHT UNTIL YOU OR YOUR OPPONENT DIE. <br />
								IF YOU LEAVE ALIVE YOU WIN GOLD, IF NOT, YOU DON'T. <br />
								IF YOU WIN MULTIPLE TIMES IN A ROW, YOU'LL GET PAID MORE.
							</blockquote>
						</>
					),
				},
				{
					choices: [
						skillCheckConditionChoice(player, "intelligence", 15, {
							text: 'Uncheck the "deathmatch" mention in the contract before signing up',
							visibleOnFail: true,
						}),
						{ text: 'Sign up and ask "Metaphysical ?"' },
						{ text: "Just sign up" },
					],
					text: () => (
						<>
							<blockquote>
								WHAT ? OF COURSE NOT. <br />
								I SAID "DIE" BECAUSE YOU DIE IN A METAPHYSICAL WAY YOU KNOW ? <br />
								SOMETHING INSIDE YOU <em>WILL</em> DIE.
							</blockquote>
						</>
					),
				},
				{
					choices: [{ condition: props => props.state.enthusiast, text: "YEAH" }, { text: "Enter the arena" }],
					exitFunction: () => {
						setFlag("cutscene.arena");
					},
					id: "last",
					text: () => (
						<blockquote>
							THANK YOU. I CAN'T WAIT TO SEE YOU FIGHT INSIDE <br /> ... <br /> THE ARENAAAAA
						</blockquote>
					),
				},
			])}
			onDialogStop={() => navigate("/arena")}
		/>
	);
}
