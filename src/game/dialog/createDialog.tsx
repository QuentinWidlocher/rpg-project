import { JsonObject } from "type-fest";
import { Choice } from "./choices";
import { MutableFunction, PartialScene } from "./dialog";
import { DialogComponent } from "~/components/dialogs/Dialog";
import { ObjectOfLiteralToPrimitiveDeep } from "~/utils/literalToPrimitive";

export function createDialog<State extends JsonObject, Keys extends string, Context extends object>(dialogProps: {
	initialState: State;
	onDialogStop?: () => void;
	setupFunction?: MutableFunction<ObjectOfLiteralToPrimitiveDeep<NoInfer<State>>, NoInfer<Keys>>;
	hideStatusBar?: boolean;
	createWithContext?: (props: {
		createChoices: (
			fn: () => Array<Choice<ObjectOfLiteralToPrimitiveDeep<NoInfer<State>>, Keys>>,
		) => Array<Choice<ObjectOfLiteralToPrimitiveDeep<NoInfer<State>>, Keys>>;
	}) => Context;
}) {
	const Component = (props: { scenes: Array<PartialScene<ObjectOfLiteralToPrimitiveDeep<NoInfer<State>>, Keys>> }) => (
		<DialogComponent<State, Keys>
			initialState={dialogProps.initialState}
			dialog={props.scenes}
			hideStatusBar={dialogProps.hideStatusBar}
			onDialogStop={dialogProps.onDialogStop}
			setupFunction={dialogProps.setupFunction}
		/>
	);

	return [Component, (dialogProps.createWithContext?.({ createChoices: fn => fn() }) ?? {}) as Context] as const;
}
