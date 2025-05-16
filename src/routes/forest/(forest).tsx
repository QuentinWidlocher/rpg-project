import { makePersisted } from "@solid-primitives/storage";
import { useNavigate } from "@solidjs/router";
import { random, sample, times } from "lodash-es";
import { createSignal } from "solid-js";
import { EmptyObject, Exact, Integer, TupleToObject, UnionToIntersection, UnionToTuple } from "type-fest";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { FOREST_NAME } from "~/constants";
import { makeDialog, Scene } from "~/game/dialog/dialog";
import { Never } from "~/utils/types";

// What kind of "things" you can encounter
type EventType = "npc" | "items" | "encounter" | "nothing";

// Something that has a chance of happening
type Probability<T extends object> = T & { chance: number };

// A list of probabilies for the events
type EventProbabilities = UnionToTuple<
	{
		[k in EventType]: Probability<{ type: k }>;
	}[EventType]
>;

// What's inside an event
type Event = Pick<Scene<EmptyObject>, "text">;

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
		encounter: Probability<{ text: Scene<any>["text"] }>[]; // @TODO
		nothing: Probability<{ text: Scene<any>["text"] }>[]; // @TODO
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
		{ chance: 1, type: "encounter" },
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

const eventPoolsByStage = {
	"+": {
		encounter: [{ chance: 1, text: "You found an impossibly tough monster" }],
		items: [{ chance: 1, text: "You found a legendary item" }],
		nothing: [{ chance: 1, text: "You found nothing !! So frustrating !!" }],
		npc: [{ chance: 1, text: "You found a unique and mysterious npc" }],
	},
	"1": {
		encounter: [{ chance: 1, text: "You found a weak monster" }],
		items: [{ chance: 1, text: "You found a basic item" }],
		nothing: [{ chance: 1, text: "You found nothing, what did you expect ?" }],
		npc: [{ chance: 1, text: "You found a boring npc" }],
	},
	"2": {
		encounter: [{ chance: 1, text: "You found a normal monster" }],
		items: [{ chance: 1, text: "You found a normal item" }],
		nothing: [{ chance: 1, text: "You found nothing, too bad." }],
		npc: [{ chance: 1, text: "You found a normal npc" }],
	},
	"3": {
		encounter: [{ chance: 1, text: "You found a pretty tough monster" }],
		items: [{ chance: 1, text: "You found a nice item" }],
		nothing: [{ chance: 1, text: "You found nothing, damn." }],
		npc: [{ chance: 1, text: "You found an npc" }],
	},
	"4": {
		encounter: [{ chance: 1, text: "You found a very tough monster" }],
		items: [{ chance: 1, text: "You found a rare item" }],
		nothing: [{ chance: 1, text: "You found nothing, fuck this game." }],
		npc: [{ chance: 1, text: "You found an interesting npc" }],
	},
} satisfies Record<Stage, Pools>;

const stageLabels = {
	"+": "The Deepest wilds",
	"1": "The forest edge",
	"2": "Beyond the last path",
	"3": "The deep woods",
	"4": "The heart of the forest",
} satisfies Record<Stage, string>;

function pickRandomProbability<T extends object>(
	probabilities: Array<Probability<T>>,
): Omit<T, keyof Probability<EmptyObject>> {
	const expendedProbabilities = probabilities.reduce<Array<number>>(
		(result, probability, index) => [...result, ...times(probability.chance, () => index)],
		[],
	);

	return probabilities[sample(expendedProbabilities)!];
}

export default function ForestPage() {
	const navigate = useNavigate();

	const [stage, setStage] = makePersisted(createSignal<Stage>("1"), { name: "forestStage" });
	const [randomPickedEventType, setRandomPickedEventType] = createSignal(
		pickRandomProbability(eventProbabilitiesByStage[stage()]).type,
	);
	const randomPickedEvent = () => pickRandomProbability(eventPoolsByStage[stage()][randomPickedEventType()]);

	return (
		<DialogComponent
			setupFunction={props => {
				props.setIllustration({
					background: "/backgrounds/forest.webp",
				});
			}}
			dialog={makeDialog([
				{
					choices: [
						{ effect: () => navigate("/map"), text: "Go back" },
						{
							effect: () => setRandomPickedEventType(pickRandomProbability(eventProbabilitiesByStage[stage()]).type),
							text: "Explore the forest",
						},
					],
					enterFunction: () => setStage("1"),
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
							condition: () => stage() != "+",
							effect: () => {
								const stageIndex = stages.findIndex(s => s == stage());
								setStage(stages[stageIndex + 1] ?? "+");
							},
							text: "Go deeper in the forest",
						},
						{
							text: "Keep on exploring here",
						},
						{
							effect: props => {
								props.setNext("start");
							},
							text: "Go back to the forest entrance",
						},
					],
					enterFunction: () => {
						setRandomPickedEventType(pickRandomProbability(eventProbabilitiesByStage[stage()]).type);
					},
					id: "event",
					text: randomPickedEvent().text,
					title: () => stageLabels[stage()],
				},
				{
					choices: [{ condition: () => false, text: " ", visibleOnFail: true }],
					enterFunction: props => {
						props.setNext(-1);
						setTimeout(() => props.continue(), random(500, 1500));
					},
					text: <>You walk for some time</>,
				},
			])}
		/>
	);
}
