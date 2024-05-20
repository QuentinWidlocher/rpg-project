import { makePersisted } from "@solid-primitives/storage";
import { ParentProps, createContext, useContext } from "solid-js";
import { SetStoreFunction, createStore } from "solid-js/store";

export type DebugContext = { showStatusBar: boolean }

export const DebugContext = createContext<{ debug: DebugContext, setDebug: SetStoreFunction<DebugContext> }>();

export function DebugProvider(props: ParentProps) {
  const [debug, setDebug] = makePersisted(createStore<DebugContext>({
    showStatusBar: false
  } satisfies DebugContext, { name: 'debug' }))

  return (
    <DebugContext.Provider value={{ debug, setDebug }}>
      {props.children}
    </DebugContext.Provider>
  )
}

export function useDebug() {
  const context = useContext(DebugContext)

  if (context == null) {
    throw new Error("You must use `useDebug` inside a `<DebugProvider/>`")
  }

  return context
}
