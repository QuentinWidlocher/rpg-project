import { ParentProps } from "solid-js";

export default function Illustration(props: ParentProps) {
  return (
    <div class="h-[17rem] rounded-none sm:rounded-t-2xl overflow-hidden w-full grid">
      {props.children}
    </div>
  )
}
