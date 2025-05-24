import { makePersisted } from "@solid-primitives/storage";
import { useLocation } from "@solidjs/router";
import { createEffect, createMemo, createSignal, on, onCleanup, onMount, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { JsonObject } from "type-fest";
import Layout from "../Layout";
import { DialogChoices } from "./DialogChoices";
import { DialogText } from "./DialogText";
import { skillCheckChoice } from "~/game/dialog/choices";
import {
	ChoiceDeclaration,
	ImmutableFunction,
	ImmutableStateFunctionParameters,
	makeDialog,
	MutableFunction,
	MutableStateFunctionParameters,
	PartialScene,
	Scene,
} from "~/game/dialog/dialog";
import { ObjectOfLiteralToPrimitiveDeep } from "~/utils/literalToPrimitive";
import { getLocalStorageObject } from "~/utils/localStorage";
import { milliseconds } from "~/utils/promises";

const BOOKMARK_DIALOG_KEY = "bookmarkedDialog";

export function DialogComponent<State extends JsonObject, Keys extends string>(props: {
	dialog: Array<PartialScene<ObjectOfLiteralToPrimitiveDeep<NoInfer<State>>, Keys>>;
	initialState?: State;
	onDialogStop?: () => void;
	setupFunction?: MutableFunction<ObjectOfLiteralToPrimitiveDeep<NoInfer<State>>, NoInfer<Keys>>;
	hideStatusBar?: boolean;
}) {
	const location = useLocation();
	const dialog = createMemo(() => makeDialog(props.dialog));

	// We changed dialog, we start again
	if (getLocalStorageObject<{ key: string }>(BOOKMARK_DIALOG_KEY)?.key != location.pathname) {
		localStorage.removeItem(BOOKMARK_DIALOG_KEY);
	}

	const [bookmarkedState, setBookmarkedState] = makePersisted(
		createStore<{
			sceneIndex: number;
			key: string;
			state: State;
		}>({ key: location.pathname, sceneIndex: 0, state: props.initialState ?? ({} as State) }),
		{ name: BOOKMARK_DIALOG_KEY },
	);

	const [state, setState] = createStore<State>(bookmarkedState.state);

	const [sceneIndex, setSceneIndex] = createSignal(bookmarkedState.sceneIndex);
	const [illustration, setIllustration] = createSignal<{
		background: string | null;
		character: string | null;
	}>({ background: null, character: null });
	const [nextSceneId, setNextSceneId] = createSignal<Keys | undefined>();
	const [prevSceneId, setPrevSceneId] = createSignal<Keys | undefined>();

	const immutableFunctionProps = () =>
		({
			from: prevSceneId(),
			isFrom: id => id == prevSceneId(),
			next: nextSceneId(),
			state: state,
		} satisfies ImmutableStateFunctionParameters<State, Keys>);

	const mutableFunctionProps = () =>
		({
			...immutableFunctionProps(),
			continue: onChoiceClick,
			setIllustration: props => setIllustration(prev => ({ ...prev, ...props })),
			setNext: (value: Keys | number | undefined) => {
				if (typeof value == "number") {
					setNextSceneId(() => dialog()[sceneIndex() + value]?.id);
				} else {
					setNextSceneId(() => value);
				}
			},
			setState: setState,
		} satisfies MutableStateFunctionParameters<State, Keys>);

	createEffect(function syncIndex() {
		setBookmarkedState("sceneIndex", sceneIndex());
	});

	const currentScene = createMemo(() => dialog().at(sceneIndex()) as Scene<State, Keys> | undefined);

	async function onChoiceClick() {
		setPrevSceneId(() => currentScene()?.id);

		currentScene()?.exitFunction?.(mutableFunctionProps());

		await milliseconds(100);

		const nextId = nextSceneId();
		const nextIndex = dialog().findIndex(scene => scene.id == nextId);

		if (nextId != prevSceneId()) {
			if (nextId) {
				setSceneIndex(nextIndex);
			} else {
				setSceneIndex(prev => prev + 1);
			}
		}

		await milliseconds(100);

		setNextSceneId(undefined);
	}

	createEffect(
		on(currentScene, function onSceneChange() {
			if (currentScene()) {
				currentScene()!.enterFunction?.(mutableFunctionProps());
			} else {
				setTimeout(() => {
					localStorage.removeItem(BOOKMARK_DIALOG_KEY);
				}, 100);
				props.onDialogStop?.();
			}
		}),
	);

	onMount(() =>
		props.setupFunction?.(mutableFunctionProps() as unknown as Parameters<(typeof props)["setupFunction"] & {}>[0]),
	);
	onCleanup(() => {
		localStorage.removeItem(BOOKMARK_DIALOG_KEY);
	});

	return (
		<Show when={currentScene()}>
			{currentScene => (
				<Layout
					hideStatusBar={props.hideStatusBar}
					illustration={
						illustration().background || illustration().character ? (
							<div class="grid grid-cols-2 grid-rows-1 @container h-full">
								{illustration().background ? (
									<img
										class="row-start-1 row-span-1 col-start-1 col-span-2 w-full h-full object-cover"
										src={illustration().background!}
									/>
								) : null}
								{illustration().character ? (
									<img
										class="row-start-1 row-span-1 col-start-1 col-span-2 @sm:col-start-2 @sm:col-end-2 @sm:col-span-1 w-full h-full object-cover object-top px-3 pt-8 pb-0"
										src={illustration().character!}
									/>
								) : null}
							</div>
						) : undefined
					}
					title={
						typeof currentScene().title == "function"
							? (currentScene().title as ImmutableFunction<State, Keys, string>)(immutableFunctionProps())
							: (currentScene().title as string)
					}
				>
					<DialogText text={currentScene().text} mutableFunctionProps={mutableFunctionProps()} />
					<DialogChoices
						choices={(() => {
							const choices = currentScene().choices;
							let declarations: ChoiceDeclaration<State, Keys>;

							if (typeof choices == "function") {
								declarations = choices({ skillCheckChoice, ...immutableFunctionProps() });
							} else {
								declarations = choices;
							}

							return declarations
								.map(declaration => {
									if (typeof declaration == "function") {
										return declaration(immutableFunctionProps());
									} else {
										return declaration;
									}
								})
								.filter(Boolean);
						})()}
						onChoiceClick={onChoiceClick}
						mutableFunctionProps={mutableFunctionProps()}
						immutableFunctionProps={immutableFunctionProps()}
					/>
				</Layout>
			)}
		</Show>
	);
}
