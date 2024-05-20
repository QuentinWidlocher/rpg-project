import { ParentProps } from "solid-js";

export default function Illustration(props: ParentProps) {
  return (
    <>
      <div class="relative h-[33vh] max-h-[17rem] w-full grid">
        <div class="hidden sm:block absolute top-0 left-0 w-full h-full scale-105 opacity-40 blur-lg">
          {props.children}
        </div>
        <div class="z-10 overflow-hidden rounded-none sm:rounded-t-2xl">
          {props.children}
        </div>
      </div>
    </>
  )
}
