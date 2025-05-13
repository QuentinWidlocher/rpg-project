import { useNavigate } from "@solidjs/router";
import { setDefaultShopDialogConfig, shopkeeperInfos } from ".";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { useFlags } from "~/contexts/flags";
import { goTo } from "~/game/dialog/choices";
import { makeDialog } from "~/game/dialog/dialog";

export default function ShopKeeperFirstEncounterDialog() {
	const { getFlag, setFlag } = useFlags();
	const navigate = useNavigate();

	return (
		<DialogComponent<{ waited: boolean }>
			key="shopKeeper.first-encounter"
			initialState={{ waited: false }}
			setupFunction={setDefaultShopDialogConfig}
			dialog={makeDialog([
				{
					choices: [{ text: "*Feign cough*" }, { text: '"Excuse me ?"' }],
					id: "first-encounter",
					text: props => (
						<>
							{props.state.waited}
							<p>Facing you is a female dwarf with dense, frizzy hairs(including her beard).</p>
							<p>She doesn't seem to have noticed you yet, as she's busy organizing shelves and updating her inventory. </p>
						</>
					),
					title: () => (getFlag("npc.shopkeeper.gotName") ? shopkeeperInfos.firstName : "Shopkeeper"),
				},
				{
					choices: [
						{ effect: props => props.setState("waited", false), text: "Not at all" },
						{ effect: props => props.setState("waited", true), text: "Actually yes" },
					],
					text: () => (
						<>
							<blockquote>OH !</blockquote>

							<p>She jumps and quickly turns to face you</p>

							<blockquote>
								Sorry here !<br /> You surprised me, I was so absorbed in my work I didn't hear you coming in.
								<br />
								Where you waiting here for a long time ?
							</blockquote>
						</>
					),
				},
				{
					choices: [
						{
							effect: goTo("buy-explanation"),
							text: "I need to buy supplies",
						},
						{
							effect: goTo("sell-explanation"),
							text: "I need to sell stuff",
						},
					],
					enterFunction: () => setFlag("npc.shopkeeper.gotName"),
					id: "questions-about-services",
					text: props => (
						<>
							<p>She looks {props.state.waited ? "worried" : "relieved"}.</p>

							<blockquote>
								{props.state.waited ? "Oh my gods, sorry for that..." : "Phew !"}
								<br />
								By the way, name's {shopkeeperInfos.firstName}. <br />
								Tell me, what can I do for you ?
							</blockquote>
						</>
					),
				},
				{
					enterFunction: props => {
						if (props.isFrom("sell-explanation")) {
							props.setNext("after-explanations");
						}
					},
					id: "buy-explanation",
					text: props => (
						<>
							<blockquote>
								{props.isFrom("questions-about-services") ? "Of course !" : "But you can also buy things."}
								<br />
								You can find everything you need here !
							</blockquote>

							<p>She marks {props.isFrom("sell-explanation") ? "another" : "a"} short pause.</p>

							<blockquote>I mean, *almost* everything haha</blockquote>
						</>
					),
				},
				{
					enterFunction: props => {
						if (!props.isFrom("buy-explanation")) {
							props.setNext("buy-explanation");
						}
					},
					id: "sell-explanation",
					text: props => (
						<>
							<blockquote>
								{props.isFrom("questions-about-services") ? "Of course !" : "But you can also sell me things."}
								<br />I buy pretty much anything from adventurers.
							</blockquote>

							<p>She marks {props.isFrom("buy-explanation") ? "another" : "a"} short pause.</p>

							<blockquote>
								<em>Almost</em> everything
							</blockquote>

							<p>She grins.</p>
						</>
					),
				},
				{
					exitFunction: () => setFlag("npc.shopkeeper.greeted"),
					id: "after-explanations",
					text: props => (
						<>
							<blockquote>Anyway, let me now if you need anything !</blockquote>
							{props.state.waited && <blockquote>And sorry again for earlier.</blockquote>}
						</>
					),
				},
			])}
			onDialogStop={() => navigate("/town")}
		/>
	);
}
