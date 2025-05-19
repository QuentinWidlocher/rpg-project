import { useNavigate } from "@solidjs/router";
import { random, sample, times } from "lodash-es";
import { Exact, UnionToTuple } from "type-fest";
import { Challenge } from "../arena/(arena)";
import { ForestFightProps } from "./fight";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { FOREST_NAME } from "~/constants";
import { skillCheck, usePlayer } from "~/contexts/player";
import { createOpponents, formatOpponents } from "~/game/character/opponents";
import { skillCheckChoice } from "~/game/dialog/choices";
import { makeDialog, Scene } from "~/game/dialog/dialog";
import { formatWithSign, ParsableDice, roll, skillModifier } from "~/utils/dice";
import { milliseconds } from "~/utils/promises";

// What kind of "things" you can encounter
const _eventTypes = ["npc", "items", "encounter", "nothing"] as const;
type EventType = (typeof _eventTypes)[number];

// Something that has a chance of happening
type Probability<T> = T extends object ? T & { chance: number } : never;

// A list of probabilies for the events
type EventProbabilities = UnionToTuple<
	{
		[k in EventType]: Probability<{ type: k }>;
	}[EventType]
>;

// All available stages (+ is kind of the default here)
const stages = ["1", "2", "3", "4", "+"] as const;
type Stage = (typeof stages)[number];

// An util to make sure all event types are addressed (because we can't use `satisfies Record<EventType, V>` with types)
type EnsureAllEvents<V, T extends Exact<Record<EventType, V>, T>> = T;

// The list of all things we can encounter in an event
type Pools = EnsureAllEvents<
	Array<any>,
	{
		npc: Probability<{ text: Scene<any>["text"] }>[]; // @TODO
		items: Probability<{ text: Scene<any>["text"] }>[]; // @TODO
		nothing: Probability<{ text: Scene<any>["text"] }>[]; // @TODO
		encounter: Probability<{ challenge: Challenge }>[];
	}
>;

const eventProbabilitiesByStage = {
	"+": [
		{ chance: 1, type: "npc" },
		{ chance: 2, type: "items" },
		{ chance: 6, type: "encounter" },
		{ chance: 2, type: "nothing" },
	],
	1: [
		{ chance: 3, type: "npc" },
		{ chance: 5, type: "items" },
		{ chance: 10, type: "encounter" },
		{ chance: 5, type: "nothing" },
	],
	2: [
		{ chance: 2, type: "npc" },
		{ chance: 2, type: "items" },
		{ chance: 2, type: "encounter" },
		{ chance: 3, type: "nothing" },
	],
	3: [
		{ chance: 1, type: "npc" },
		{ chance: 2, type: "items" },
		{ chance: 4, type: "encounter" },
		{ chance: 1, type: "nothing" },
	],
	4: [
		{ chance: 1, type: "npc" },
		{ chance: 2, type: "items" },
		{ chance: 5, type: "encounter" },
		{ chance: 1, type: "nothing" },
	],
} satisfies Record<Stage, EventProbabilities>;

const eventPoolsByStage: Record<Stage, Pools> = {
	"+": {
		encounter: [{ challenge: { opponents: { greenHag: 1 } }, chance: 1 }],
		items: [{ chance: 1, text: "You found a legendary item" }],
		nothing: [{ chance: 1, text: "You found nothing !! So frustrating !!" }],
		npc: [{ chance: 1, text: "You found a unique and mysterious npc" }],
	},
	"1": {
		encounter: [
			{ challenge: { opponents: { boar: roll("1d2") } }, chance: 10 },
			{ challenge: { opponents: { badger: roll("1d2+1") } }, chance: 1 },
		],
		items: [{ chance: 1, text: "You found a basic item" }],
		nothing: [{ chance: 1, text: "You found nothing, what did you expect ?" }],
		npc: [{ chance: 1, text: "You found a boring npc" }],
	},
	"2": {
		encounter: [{ challenge: { opponents: { wolf: roll("1d4+1") } }, chance: 1 }],
		items: [{ chance: 1, text: "You found a normal item" }],
		nothing: [{ chance: 1, text: "You found nothing, too bad." }],
		npc: [{ chance: 1, text: "You found a normal npc" }],
	},
	"3": {
		encounter: [{ challenge: { opponents: { blackBear: roll("1d4+2") } }, chance: 1 }],
		items: [{ chance: 1, text: "You found a nice item" }],
		nothing: [{ chance: 1, text: "You found nothing, damn." }],
		npc: [{ chance: 1, text: "You found an npc" }],
	},
	"4": {
		encounter: [{ challenge: { opponents: { ogre: roll("1d2") } }, chance: 1 }],
		items: [{ chance: 1, text: "You found a rare item" }],
		nothing: [{ chance: 1, text: "You found nothing, fuck this game." }],
		npc: [{ chance: 1, text: "You found an interesting npc" }],
	},
};

const stageLabels = {
	"+": "The Deepest wilds",
	"1": "The forest edge",
	"2": "Beyond the last path",
	"3": "The deep woods",
	"4": "The heart of the forest",
} satisfies Record<Stage, string>;

type AnyEventOf<T extends EventType> = (typeof eventPoolsByStage)[Stage][T][number];

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

export default function ForestPage() {
	const navigate = useNavigate();
	const { player } = usePlayer();

	return (
		<DialogComponent<{
			eventIndex: number;
			eventType: EventType;
			opponentSpottedYou: boolean;
			stage: Stage;
		}>
			initialState={{
				eventIndex: 0,
				eventType: "nothing",
				opponentSpottedYou: false,
				stage: "1",
			}}
			setupFunction={props => {
				props.setIllustration({
					background: "/backgrounds/forest.webp",
				});
			}}
			dialog={makeDialog([
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
					choices: [
						{
							condition: props =>
								props.state.stage != "+" && (props.state.eventType != "encounter" || !props.state.opponentSpottedYou),
							effect: props => {
								const stageIndex = stages.findIndex(s => s == props.state.stage);
								props.setState("stage", stages[stageIndex + 1] ?? "+");
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
									} satisfies ForestFightProps,
								}),
							text: "Fight",
						},
						skillCheckChoice(player, "stealth", 10, {
							condition: props => props.state.eventType == "encounter" && !props.state.opponentSpottedYou,
							failure: props =>
								navigate("./fight", {
									state: {
										challenge: (
											eventPoolsByStage[props.state.stage][props.state.eventType][
												props.state.eventIndex
											] as AnyEventOf<"encounter">
										).challenge,
										sneakAttack: false,
									} satisfies ForestFightProps,
								}),
							success: props =>
								navigate("./fight", {
									state: {
										challenge: (
											eventPoolsByStage[props.state.stage][props.state.eventType][
												props.state.eventIndex
											] as AnyEventOf<"encounter">
										).challenge,
										sneakAttack: true,
									} satisfies ForestFightProps,
								}),
							text: "Try to sneak on them",
						}),
						{
							condition: props => props.state.eventType != "encounter" || !props.state.opponentSpottedYou,
							effect: props => {
								if (props.state.stage != "1") {
									const stageIndex = stages.findIndex(s => s == props.state.stage);
									props.setState("stage", stages[stageIndex - 1] ?? "1");
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
							case "nothing":
							case "items":
							case "npc": {
								const event = eventPoolsByStage[props.state.stage][props.state.eventType][props.state.eventIndex];
								return typeof event.text == "function" ? event.text(props) : event.text;
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
						console.log("stop walking");
					},
					text: <>You walk for some time</>,
				},
			])}
		/>
	);
}
