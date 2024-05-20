import { JSXElement, ParentProps } from "solid-js";
import Illustration from "./Illustration";
import TitleBox from "./TitleBox";
import StatusBar from "./StatusBar";
import { twJoin } from "tailwind-merge";

export default function Layout(props: ParentProps<{
  illustration?: JSXElement,
  title?: string,
  hideStatusBar?: boolean,
  compact?: boolean,
}>) {
  return (
    <div class="bg-base-100 h-dvh w-screen flex place-content-center sm:p-5 font-serif">
      <main class="@container bg-base-200 shadow-lg shadow-base-300/25 w-full min-h-full sm:w-[30rem] card rounded-none sm:rounded-2xl">
        {(props.hideStatusBar) ? null : (<StatusBar transparent={props.illustration != null} />)}
        {props.illustration ? <figure class={twJoin("shadow-xl overflow-visible", !props.hideStatusBar ? '-mt-5' : null)}>
          <Illustration>{props.illustration}</Illustration>
        </figure> : null}
        {props.title ? <TitleBox title={props.title} /> : null}
        <div class={twJoin(
          "card-body overflow-auto bg-base-200 rounded-b-xl z-10",
          props.hideStatusBar && !props.illustration ? 'rounded-t-xl' : null,
          props.compact ? 'p-0' : null,
        )}>
          {props.children}
        </div>
      </main>
    </div>
  )
}
