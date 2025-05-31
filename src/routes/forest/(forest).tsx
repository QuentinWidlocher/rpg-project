import { useLocation, useNavigate } from "@solidjs/router";
import { random, sample, times } from "lodash-es";
import { Exact as ExactRecord, UnionToTuple } from "type-fest";
import { Challenge } from "../arena/(arena)";
import { ForestFightProps } from "./fight";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { FOREST_NAME } from "~/constants";
import { addBasicItemToInventory, skillCheck, usePlayer } from "~/contexts/player";
import { createOpponents, formatOpponents } from "~/game/character/opponents";
import { MutableStateFunctionParameters, Scene } from "~/game/dialog/dialog";
import { BasicItemKey, formatItemList, ItemList } from "~/game/items/items";
import { formatWithSign, ParsableDice, roll, skillModifier } from "~/utils/dice";
import { exact } from "~/utils/literalToPrimitive";
import { milliseconds } from "~/utils/promises";

// What kind of "things" you can encounter
const _eventTypes = ["encounter", "items", "nothing", "npc"] as const;
type EventType = (typeof _eventTypes)[number];

// Something that has a chance of happening
type Probability<T> = T extends object ? T & { chance: number } : never;

// A list of probabilies for the events
type EventProbabilities = UnionToTuple<{ [k in EventType]: Probability<{ type: k }> }[EventType]>;

// All available stages (+ is kind of the default here)
const forestStages = [
	"1",
	"2",
	// "3", "4", "+"
] as const;
export type ForestStage = (typeof forestStages)[number];

// An util to make sure all event types are addressed (because we can't use `satisfies Record<EventType, V>` with types)
type EnsureAllEvents<V, T extends ExactRecord<Record<EventType, V>, T>> = T;

// The list of all things we can encounter in an event
type Pools = EnsureAllEvents<
	Array<any>,
	{
		npc: Probability<{ text: Scene<any, string>["text"] }>[]; // @TODO
		items: Probability<{ items: Array<{ itemKey: BasicItemKey; quantity: () => number }> }>[];
		nothing: Probability<{ text: Scene<any, string>["text"] }>[];
		encounter: Probability<{ challenge: Challenge }>[];
	}
>;

const eventProbabilitiesByStage = {
	// "+": [
	// 	{ chance: 1, type: "npc" },
	// 	{ chance: 2, type: "items" },
	// 	{ chance: 6, type: "encounter" },
	// 	{ chance: 2, type: "nothing" },
	// ],
	1: [
		{ chance: 10, type: "encounter" },
		{ chance: 5, type: "items" },
		{ chance: 5, type: "nothing" },
		{ chance: 3, type: "npc" },
	],
	2: [
		{ chance: 8, type: "encounter" },
		{ chance: 5, type: "items" },
		{ chance: 3, type: "nothing" },
		{ chance: 3, type: "npc" },
	],
	// 3: [
	// 	{ chance: 1, type: "npc" },
	// 	{ chance: 2, type: "items" },
	// 	{ chance: 4, type: "encounter" },
	// 	{ chance: 1, type: "nothing" },
	// ],
	// 4: [
	// 	{ chance: 1, type: "npc" },
	// 	{ chance: 2, type: "items" },
	// 	{ chance: 5, type: "encounter" },
	// 	{ chance: 1, type: "nothing" },
	// ],
} satisfies Record<ForestStage, EventProbabilities>;

const eventPoolsByStage: Record<ForestStage, Pools> = {
	// "+": {
	// 	encounter: [{ challenge: { opponents: { greenHag: 1 } }, chance: 1 }],
	// 	items: [{ chance: 1, text: "You found a legendary item" }],
	// 	nothing: [{ chance: 1, text: "You found nothing !! So frustrating !!" }],
	// 	npc: [{ chance: 1, text: "You found a unique and mysterious npc" }],
	// },
	"1": {
		encounter: [
			{ challenge: { opponents: { boar: roll("1d2") } }, chance: 10 },
			{ challenge: { opponents: { badger: roll("1d2+1") } }, chance: 1 },
		],
		items: [
			{
				chance: 1,
				items: [
					{ itemKey: "celandine", quantity: () => Math.max(0, roll("1d3") - 1) },
					{ itemKey: "hemlock", quantity: () => Math.max(0, roll("1d2") - 1) },
					{ itemKey: "nettle", quantity: () => Math.max(0, roll("2d2") - 2) },
					{ itemKey: "sage", quantity: () => Math.max(0, roll("1d3") - 1) },
				],
			},
		],
		nothing: [{ chance: 1, text: "Nothing catches you eye as you walk the forest." }],
		npc: [
			{ chance: 1, text: "You see someone walking on the path." },
			{ chance: 1, text: "You see someone sitting on a rock playing a luth. They don't play that well..." },
			{ chance: 1, text: "You see a lumber jack walking out the forest with logs in her arms." },
		],
	},
	"2": {
		encounter: [{ challenge: { opponents: { wolf: roll("1d4+1") } }, chance: 2 }],
		items: [
			{
				chance: 2,
				items: [
					{ itemKey: "celandine", quantity: () => Math.max(0, roll("2d3") - 1) },
					{ itemKey: "hemlock", quantity: () => Math.max(0, roll("2d2") - 1) },
					{ itemKey: "nettle", quantity: () => Math.max(0, roll("3d2") - 2) },
					{ itemKey: "sage", quantity: () => Math.max(0, roll("2d3") - 1) },
				],
			},
			{
				chance: 1,
				items: [{ itemKey: "deerAntlers", quantity: () => Math.max(0, roll("1d2")) }],
			},
		],
		nothing: [{ chance: 1, text: "You found nothing, too bad." }],
		npc: [{ chance: 1, text: "You found a normal npc" }],
	},
	// "3": {
	// 	encounter: [{ challenge: { opponents: { blackBear: roll("1d4+2") } }, chance: 1 }],
	// 	items: [{ chance: 1, text: "You found a nice item" }],
	// 	nothing: [{ chance: 1, text: "You found nothing, damn." }],
	// 	npc: [{ chance: 1, text: "You found an npc" }],
	// },
	// "4": {
	// 	encounter: [{ challenge: { opponents: { ogre: roll("1d2") } }, chance: 1 }],
	// 	items: [{ chance: 1, text: "You found a rare item" }],
	// 	nothing: [{ chance: 1, text: "You found nothing, fuck this game." }],
	// 	npc: [{ chance: 1, text: "You found an interesting npc" }],
	// },
};

const stageLabels = {
	// "+": "The Deepest wilds",
	"1": "The forest edge",
	"2": "Beyond the last path",
	// "3": "The deep woods",
	// "4": "The heart of the forest",
} satisfies Record<ForestStage, string>;

type AnyEventOf<T extends EventType> = (typeof eventPoolsByStage)[ForestStage][T][number];

function pickRandomProbabilityIndex(probabilities: Array<Probability<object>>): number {
	const expandedProbabilities = probabilities.reduce<Array<number>>(
		(result, probability, index) => [...result, ...times(probability.chance, () => index)],
		[],
	);

	return sample(expandedProbabilities)!;
}

function pickRandomProbability<T extends object>(probabilities: Array<Probability<T>>): T {
	const index = pickRandomProbabilityIndex(probabilities);
	return probabilities[index];
}

export type ForestProps = { forceStage?: ForestStage };

export default function ForestPage() {
	const navigate = useNavigate();
	const { player, setPlayer } = usePlayer();
	const location = useLocation<ForestProps>();

	return (
		<DialogComponent
			initialState={{
				eventIndex: 0,
				eventType: exact<EventType>("nothing"),
				item: exact<BasicItemKey>("boarHide"),
				itemsRolled: exact<ItemList<BasicItemKey>>([]),
				opponentSpottedYou: false,
				stage: exact<ForestStage>("1"),
			}}
			setupFunction={props => {
				props.setIllustration({
					background: "/backgrounds/forest.webp",
				});
				if (location.state?.forceStage) {
					props.setState("stage", location.state.forceStage);
					props.setNext("event");
					props.continue();
				}
			}}
			dialog={[
				{
					choices: [
						{
							text: "Explore the forest",
						},
						{ effect: () => navigate("/map"), text: "Go back" },
					],
					enterFunction: props => props.setState("stage", "1"),
					id: "start",
					text: (
						<>
							<h2>You enter {FOREST_NAME}.</h2>
							<p>It's a lush forest with big overarching trees covering the skies.</p>
							<p>You can feel you're not alone here.</p>
						</>
					),
					title: FOREST_NAME,
				},
				{
					choices: ({ skillCheckChoice }) => [
						{
							condition: props =>
								props.state.stage != forestStages.at(-1) &&
								(props.state.eventType != "encounter" || !props.state.opponentSpottedYou),
							effect: props => {
								const stageIndex = forestStages.findIndex(s => s == props.state.stage);
								props.setState("stage", forestStages[stageIndex + 1] ?? "+");
							},
							text: "Go deeper in the forest",
						},
						{
							condition: props => props.state.eventType != "encounter" || !props.state.opponentSpottedYou,
							text: "Keep on exploring here",
						},
						{
							condition: props => props.state.eventType == "encounter" && props.state.opponentSpottedYou,
							effect: props =>
								navigate("./fight", {
									state: {
										challenge: (
											eventPoolsByStage[props.state.stage][props.state.eventType][
												props.state.eventIndex
											] as AnyEventOf<"encounter">
										).challenge,
										goBackToStage: props.state.stage,
									} satisfies ForestFightProps,
								}),
							text: "Fight",
						},
						skillCheckChoice(player, "stealth", 10, {
							condition: props => props.state.eventType == "encounter" && !props.state.opponentSpottedYou,
							failure: props => {
								return navigate("./fight", {
									state: {
										challenge: (
											eventPoolsByStage[props.state.stage][props.state.eventType][
												props.state.eventIndex
											] as AnyEventOf<"encounter">
										).challenge,
										goBackToStage: props.state.stage,
										sneakAttack: false,
									} satisfies ForestFightProps,
								});
							},
							success: props =>
								navigate("./fight", {
									state: {
										challenge: (
											eventPoolsByStage[props.state.stage][props.state.eventType][
												props.state.eventIndex
											] as AnyEventOf<"encounter">
										).challenge,
										goBackToStage: props.state.stage,
										sneakAttack: true,
									} satisfies ForestFightProps,
								}),
							text: "Try to sneak on them",
						}),
						{
							condition: props => props.state.eventType != "encounter" || !props.state.opponentSpottedYou,
							effect: props => {
								if (props.state.stage != "1") {
									const stageIndex = forestStages.findIndex(s => s == props.state.stage);
									props.setState("stage", forestStages[stageIndex - 1] ?? "1");
								} else {
									props.setNext("start");
								}
							},
							text: "Go back in the forest",
							visibleOnFail: true,
						},
					],
					enterFunction: props => {
						props.setState("eventType", pickRandomProbability(eventProbabilitiesByStage[props.state.stage]).type);
						console.debug("props.state.stage", props.state.stage);
						console.debug("props.state.eventType", props.state.eventType);
						const randomProbabilityIndex = pickRandomProbabilityIndex(
							eventPoolsByStage[props.state.stage][props.state.eventType],
						);
						props.setState("eventIndex", randomProbabilityIndex);

						props.setState("opponentSpottedYou", false);

						if (props.state.eventType == "encounter") {
							const event = eventPoolsByStage[props.state.stage][props.state.eventType][props.state.eventIndex];
							const opponents = createOpponents(event.challenge.opponents);
							const theOneOnTheLookout = sample(opponents)!;
							const wisdomBonus = skillModifier(theOneOnTheLookout.skills.wisdom);
							const opponentPerceptionCheck = roll(`1d20${formatWithSign(wisdomBonus)}` as ParsableDice);
							const playerStealthCheck = skillCheck(player, "stealth", opponentPerceptionCheck);
							props.setState("opponentSpottedYou", !playerStealthCheck);
						} else if (props.state.eventType == "items") {
							props.setState("itemsRolled", []);
							const event = eventPoolsByStage[props.state.stage][props.state.eventType][props.state.eventIndex];

							for (const { itemKey, quantity } of event.items) {
								const rolledQuantity = quantity();
								addBasicItemToInventory({ set: setPlayer, value: player }, itemKey, rolledQuantity);
								props.setState("itemsRolled", props.state.itemsRolled.length, { key: itemKey, quantity: rolledQuantity });
							}
						}
					},
					id: "event",
					text: props => {
						switch (props.state.eventType) {
							case "encounter": {
								const event = eventPoolsByStage[props.state.stage][props.state.eventType][props.state.eventIndex];
								const opponentNames = formatOpponents(event.challenge.opponents, undefined, { style: "long" });

								return `You see ${opponentNames}. They ${
									props.state.opponentSpottedYou ? "see you and attack." : "didn't see you yet."
								}`;
							}
							case "items": {
								return `On the ground, you found ${formatItemList(props.state.itemsRolled)}`;
							}
							case "nothing":
							case "npc": {
								const event = eventPoolsByStage[props.state.stage][props.state.eventType][props.state.eventIndex];
								return typeof event.text == "function"
									? event.text(props as MutableStateFunctionParameters<any, string>)
									: event.text;
							}
							default:
								return "";
						}
					},
					title: props => stageLabels[props.state.stage],
				},
				{
					choices: [{ condition: () => false, text: "Walking...", visibleOnFail: true }],
					enterFunction: async props => {
						await milliseconds(random(500, 1500));
						console.group("walking");
						props.setNext(-1);
						console.debug("props.next", props.next);

						await props.continue();
						console.groupEnd();
					},
					text: <>You walk for some time</>,
				},
			]}
		/>
	);
}
