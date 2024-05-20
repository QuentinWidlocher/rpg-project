import { ImmutableStateFunctionParameters, Scene } from "~/game/dialog/dialog";

export function DialogText(props: {
  text: Scene['text'],
  immutableFunctionProps: ImmutableStateFunctionParameters
}) {

  return (
    <div class="prose prose-stone text-base-content text-opacity-70 overflow-y-auto whitespace-pre-wrap"  >
      {props.text(props.immutableFunctionProps)}
    </div>
  )
}
