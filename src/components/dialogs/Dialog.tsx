import { makePersisted } from "@solid-primitives/storage";
import { Show, batch, createEffect, createMemo, createSignal, on, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { EmptyObject, JsonObject } from "type-fest";
import { useLocation } from "@solidjs/router";
import Layout from "../Layout";
import { DialogChoices } from "./DialogChoices";
import { DialogText } from "./DialogText";
import {
	ImmutableStateFunctionParameters,
	MutableFunction,
	MutableStateFunctionParameters,
	Scene,
} from "~/game/dialog/dialog";
import { getLocalStorageObject } from "~/utils/localStorage";

const BOOKMARK_DIALOG_KEY = "bookmarkedDialog";

export function DialogComponent<State extends JsonObject>(
	props: (State extends EmptyObject
		? {
				initialState?: undefined;
		  }
		: { initialState: State }) & {
		dialog: Array<Scene<State>>;
		onDialogStop?: () => void;
		setupFunction?: MutableFunction<State>;
		hideStatusBar?: boolean;
	},
) {
	const location = useLocation();

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
	const [nextSceneId, setNextSceneId] = createSignal<string | undefined>();
	const [prevSceneId, setPrevSceneId] = createSignal<string | undefined>();

	const immutableFunctionProps = () =>
		({
			from: prevSceneId(),
			isFrom: id => id == prevSceneId(),
			next: nextSceneId(),
			state: state,
		} satisfies ImmutableStateFunctionParameters<State>);

	const mutableFunctionProps = () =>
		({
			...immutableFunctionProps(),
			continue: onChoiceClick,
			setIllustration: props => setIllustration(prev => ({ ...prev, ...props })),
			setNext: setNextSceneId,
			setState: setState,
		} satisfies MutableStateFunctionParameters<State>);

	createEffect(function syncIndex() {
		setBookmarkedState("sceneIndex", sceneIndex());
	});

	const currentScene = createMemo(() => props.dialog.at(sceneIndex()) as Scene<State> | undefined);

	function onChoiceClick() {
		batch(() => {
			setPrevSceneId(currentScene()?.id);

			currentScene()?.exitFunction?.(mutableFunctionProps());

			if (nextSceneId() != prevSceneId()) {
				if (nextSceneId()) {
					setSceneIndex(props.dialog.findIndex(scene => scene.id == nextSceneId()));
				} else {
					setSceneIndex(prev => prev + 1);
				}
			}

			setNextSceneId(undefined);
		});
	}

	createEffect(
		on(currentScene, function onSceneChange() {
			if (currentScene()) {
				currentScene()!.enterFunction?.(mutableFunctionProps());
			} else {
				props.onDialogStop?.();
			}
		}),
	);

	onMount(() => props.setupFunction?.(mutableFunctionProps()));

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
							? (currentScene().title as MutableFunction<State, string>)(mutableFunctionProps())
							: (currentScene().title as string)
					}
				>
					<DialogText text={currentScene().text} mutableFunctionProps={mutableFunctionProps()} />
					<DialogChoices
						choices={currentScene().choices.filter(Boolean)}
						onChoiceClick={onChoiceClick}
						mutableFunctionProps={mutableFunctionProps()}
						immutableFunctionProps={immutableFunctionProps()}
					/>
				</Layout>
			)}
		</Show>
	);
}
