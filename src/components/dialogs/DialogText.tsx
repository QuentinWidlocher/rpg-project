import { JsonObject } from "type-fest";
import { MutableStateFunctionParameters, Scene } from "~/game/dialog/dialog";

export function DialogText<State extends JsonObject, Keys extends string>(props: {
	text: Scene<State, Keys>["text"];
	mutableFunctionProps: MutableStateFunctionParameters<State, Keys>;
}) {
	return (
		<div class="prose prose-stone text-base-content text-opacity-70 overflow-y-auto whitespace-pre-wrap">
			{typeof props.text == "function" ? props.text(props.mutableFunctionProps) : props.text}
		</div>
	);
}
