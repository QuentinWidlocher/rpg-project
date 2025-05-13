import { JsonObject } from "type-fest";
import { MutableStateFunctionParameters, Scene } from "~/game/dialog/dialog";

export function DialogText<State extends JsonObject>(props: {
	text: Scene<State>["text"];
	mutableFunctionProps: MutableStateFunctionParameters<State>;
}) {
	return (
		<div class="prose prose-stone text-base-content text-opacity-70 overflow-y-auto whitespace-pre-wrap">
			{typeof props.text == "function" ? props.text(props.mutableFunctionProps) : props.text}
		</div>
	);
}
