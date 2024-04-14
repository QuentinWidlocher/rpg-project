import { RouteDefinition, createAsync } from "@solidjs/router";
import { For, Setter, Show, createEffect, createSignal } from "solid-js";
import { SetStoreFunction, createStore, produce } from "solid-js/store";
import Layout from "~/components/Layout";
import { AsyncFunction, Dialog, renderText, AsyncFunctionType } from "~/dialog/dialog-system/system";
import { Await } from "~/utils/await";
import { WithLoaderData } from "~/utils/loaderData";

export const route = {
  load: async ({ params }) => fetch(`/scenes/${params.id}.json`).then(res => res.json()) as Promise<Dialog[]>

} satisfies RouteDefinition

const globalTimeout = 0

function createMutableFunction(code: string): MutableFunction {
  return new AsyncFunction(
    'state',
    'setState',
    'produce',
    'next',
    'setBackground',
    'setCharacter',
    code,
  );

}

type MutableFunction = AsyncFunctionType<[
  state: Record<string, any>,
  setState: (cb: (state: Record<string, any>) => void) => void,
  produce: typeof produce,
  next: (id: string) => void,
  setBackground: (url: string) => void,
  setCharacter: (url: string) => void,
],
  void
>

function Choices(props: {
  choices: Dialog['choices'],
  onChoiceClick: () => void,
  setNextDialogId: Setter<string | undefined>,
  state: { state: Record<string, any>, setState: SetStoreFunction<Record<string, any>> },
  setIllustration: Setter<{
    background: string | null;
    character: string | null;
  }>
}) {

  const choices = () => Promise.all(props.choices.map(async (choice) => {
    const text = await renderText(choice.text, { state: props.state.state })
    let effect: MutableFunction | undefined = undefined;

    if (choice.effect) {
      effect = createMutableFunction(choice.effect)
    }

    if (text) {
      return { text, effect }
    } else {
      return undefined
    }
  })).then(choices => choices.filter(Boolean)).then(x => new Promise<typeof x>(r => setTimeout(() => r(x), 2 * globalTimeout)))

  async function onChoiceClick(choice?: Awaited<ReturnType<typeof choices>>[number]) {
    await choice?.effect?.(
      props.state.state,
      props.state.setState,
      produce,
      props.setNextDialogId,
      (url) => props.setIllustration(prev => ({ ...prev, background: url })),
      (url) => props.setIllustration(prev => ({ ...prev, character: url })),
    )
    props.onChoiceClick()
  }

  return (
    <ul class="-m-4 mt-auto menu bg-base-200 rounded-xl gap-2">
      <Await fallback={
        (props.choices.length > 0 ? props.choices : [{ text: 'Continuer' }]).filter(choice => !(choice.text.startsWith('$') && choice.text.includes("''"))).map(choice => (
          <li class="btn btn-ghost bg-base-300 animate-pulse text-[rgba(0,0,0,0)]">{choice.text}</li>
        )
        )} resolve={choices()}>
        {choices =>
          <For
            each={choices()}
            fallback={
              <li onClick={() => onChoiceClick()} class="btn btn-ghost">Continuer</li>
            }
          >
            {choice =>
              <li onClick={() => onChoiceClick(choice)} class="btn btn-ghost">{choice.text}</li>
            }
          </For>
        }
      </Await>
    </ul>
  )
}

function stripHtml(html: string) {
  let tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function stripEmptyHtmlTags(html: string) {
  let tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  for (const node of tmp.children) {
    if (!node.textContent) {
      tmp.removeChild(node)
    }
  }
  return tmp.innerHTML
}

function Text(props: {
  text: Dialog['text'],
  state: { state: Record<string, any>, setState: SetStoreFunction<Record<string, any>> }
}) {
  const text = () => Promise.all(
    props.text.split('<br>').map(async line => {
      const rendered = await renderText(line, { state: props.state.state });
      if (rendered.trim()) {
        if (stripHtml(rendered.trim())) {
          return `${rendered.trim()}<br>`
        } else {
          return rendered.trim()
        }
      } else {
        return null
      }
    })).then(x => {
      const filtered = x.filter(Boolean).join('')
      const result = stripEmptyHtmlTags(filtered);
      return result
    }).then(x => new Promise<typeof x>(r => setTimeout(() => r(x), 1 * globalTimeout)))


  return (
    <Await resolve={text()} fallback={(
      <ul class="flex flex-col gap-1">
        {new Array(props.text.split('<br>').map(stripHtml).filter(line => !(line.startsWith('$') && (line.includes("''") || line.includes('""')))).length).fill(null).map(() => (
          <li>
            <div class={`mt-2 skeleton h-3 ${['w-full', 'w-1/2', 'w-3/4', 'w-5/6'].at(Math.floor(Math.random() * 4))}`} />
          </li>

        ))}
      </ul>
    )}>
      {text => <div class="prose overflow-y-auto" innerHTML={text()} />}
    </Await>
  )
}

function DialogComponent(props: {
  dialog: Dialog,
  onChoiceClick: () => void,
  state: { state: Record<string, any>, setState: SetStoreFunction<Record<string, any>> },
  setNextDialogId: Setter<string | undefined>
}) {
  const [illustration, setIllustration] = createSignal<{ background: string | null, character: string | null }>({ background: null, character: null })

  const effectsRunning = () => new Promise<boolean>(async resolve => {
    for (const func of props.dialog.functions) {
      const fn = createMutableFunction(func);
      await fn(
        props.state.state,
        props.state.setState,
        produce,
        props.setNextDialogId,
        (url) => setIllustration(prev => ({ ...prev, background: url })),
        (url) => setIllustration(prev => ({ ...prev, character: url })),
      );
    }
    resolve(true)
  })

  createEffect(() => console.log(illustration()))
  return (
    <Await resolve={effectsRunning()}>
      {() =>
        <Layout illustration={illustration().background || illustration().character ? (
          <img class="w-full h-full object-cover" src={illustration().background!} />
        ) : undefined} title={props.dialog.title}>
          <Text state={props.state} text={props.dialog.text} />
          <Choices
            setNextDialogId={props.setNextDialogId}
            state={props.state}
            choices={props.dialog.choices}
            onChoiceClick={props.onChoiceClick}
            setIllustration={setIllustration}
          />
        </Layout>
      }
    </Await>
  )
}

function Scene(props: { scene: Dialog[] }) {
  const [dialogIndex, setDialogIndex] = createSignal(0)
  const [nextDialogId, setNextDialogId] = createSignal<string | undefined>();
  const [state, setState] = createStore<Record<string, any>>({})

  function onChoiceClick() {
    if (nextDialogId()) {
      setDialogIndex(props.scene.findIndex(dialog => dialog.id == nextDialogId()))
      setNextDialogId(undefined)
    } else {
      setDialogIndex(prev => prev + 1)
    }
  }

  return <DialogComponent
    state={{ state, setState }}
    onChoiceClick={onChoiceClick}
    setNextDialogId={setNextDialogId}
    dialog={props.scene[dialogIndex()]}
  />
}

export default function ScenePage(props: WithLoaderData<typeof route>) {
  return (
    <Await resolve={props.data}>
      {scene => (
        <Scene scene={scene()} />
      )}
    </Await>
  );
}
