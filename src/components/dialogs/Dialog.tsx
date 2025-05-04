import { Show, batch, createEffect, createMemo, createSignal, on } from "solid-js";
import Layout from "../Layout";
import { DialogText } from "./DialogText";
import { DialogChoices } from "./DialogChoices";
import { Navigate } from "@solidjs/router";
import { Dialog, ImmutableStateFunctionParameters, MutableStateFunctionParameters, Scene } from "~/game/dialog/dialog";

export function DialogComponent(props: { dialog: Dialog; onDialogStop?: () => void }) {
	const [sceneIndex, setSceneIndex] = createSignal(0);
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
		} satisfies ImmutableStateFunctionParameters);

	const mutableFunctionProps = () =>
		({
			...immutableFunctionProps(),
			setIllustration: props => setIllustration(prev => ({ ...prev, ...props })),
			setNext: setNextSceneId,
			continue: onChoiceClick,
		} satisfies MutableStateFunctionParameters);

	const currentScene = createMemo(() => props.dialog.at(sceneIndex()) as Scene | undefined);

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
				console.log("=>", currentScene()!.id);
				currentScene()!.enterFunction?.(mutableFunctionProps());
			} else {
				props.onDialogStop?.();
			}
		}),
	);

	return (
		<Show when={currentScene()} fallback={<Navigate href="/500" />}>
			{currentScene => (
				<Layout
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
										class="row-start-1 row-span-1 col-start-1 col-span-2 @sm:col-start-2 @sm:col-end-2 @sm:col-span-1 w-full h-full object-contain object-bottom px-3 pt-8 pb-0"
										src={illustration().character!}
									/>
								) : null}
							</div>
						) : undefined
					}
					title={
						typeof currentScene().title == "function"
							? (currentScene().title as Function)(immutableFunctionProps())
							: currentScene().title
					}
				>
					<DialogText text={currentScene().text} immutableFunctionProps={immutableFunctionProps()} />
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
