import { JSXElement, ParentProps } from "solid-js";
import Illustration from "./Illustration";
import TitleBox from "./TitleBox";

export default function Layout(props: ParentProps<{ illustration?: JSXElement, title?: string }>) {
  return (
    <div class="bg-base-200 h-screen w-screen flex place-content-center sm:p-5">
      <main class="bg-base-100 w-full min-h-full sm:w-[30rem] card rounded-none sm:rounded-2xl">
        {props.illustration ? <figure class="shadow-xl overflow-visible rounded-none sm:rounded-t-2xl"><Illustration>{props.illustration}</Illustration></figure> : null}
        {props.title ? <TitleBox title={props.title} /> : null}
        <div class="card-body overflow-hidden">
          {props.children}
        </div>
      </main>
    </div>
  )
}
