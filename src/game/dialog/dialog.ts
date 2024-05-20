import { JSXElement } from "solid-js"

export type MutableFunction = (props: MutableStateFunctionParameters) => void
export type ImmutableFunction<Return = string> = (props: ImmutableStateFunctionParameters) => Return

export type ImmutableStateFunctionParameters = {
  from: string | undefined,
  isFrom: (id: string) => boolean,
  next: string | undefined,
}

export type MutableStateFunctionParameters = ImmutableStateFunctionParameters & {
  setNext: (id: string | undefined) => void,
  setIllustration: (props: { character?: string, background?: string }) => void
  continue: () => void
}

export type Choice = {
  text: ImmutableFunction
  effect?: MutableFunction
  condition?: ImmutableFunction<boolean | undefined>
}

export type Scene = {
  id: string
  title: ImmutableFunction
  text: ImmutableFunction<JSXElement>,
  choices: Array<Choice>
  enterFunction?: MutableFunction,
  exitFunction?: MutableFunction,
}

export type Dialog = Array<Scene>

type PartialScene = Omit<Scene, 'id' | 'title' | 'choices'> & Partial<Scene>

export type PartialDialog = Array<PartialScene>

export function makeDialog(partialDialog: PartialDialog): Dialog {
  let result: Dialog = []

  let i = 0
  for (const scene of partialDialog) {
    result.push({
      id: crypto.randomUUID(),
      title: result[i - 1]?.title ?? (() => ''),
      choices: [],
      ...scene,
    })

    i++
  }

  return result;
}
