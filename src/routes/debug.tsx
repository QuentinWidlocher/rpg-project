import { A } from "@solidjs/router";
import Layout from "~/components/Layout";
import { DebugContext, useDebug } from "~/contexts/debug";

export default function DebugPage() {
  const { debug, setDebug } = useDebug()

  function DebugBoolean(props: { key: keyof DebugContext, label: string }) {
    return <div class="form-control">
      <label class="label justify-start gap-5 cursor-pointer">
        <input type="checkbox" class="toggle toggle-primary" checked={debug[props.key]} onChange={(e) => setDebug(props.key, e.target.checked)} />
        <span class="label-text">{props.label}</span>
      </label>
    </div>
  }

  return <Layout title="Debug menu">
    <div class="h-full flex flex-col">
      <ul class="flex flex-col gap-5">
        <li> <DebugBoolean key="showStatusBar" label="Show status bar" /> </li>
        <li><button onClick={() => {
          if (window.confirm('Are you sure ?')) {
            localStorage.clear();
            window.location.href = '/' // hard ugly refresh, we don't care !!
          }
        }} class="btn btn-error btn-outline btn-block">🚨 Delete all stored data 🚨</button></li>
      </ul>

      <A class="btn btn-ghost bg-base-300 btn-block mt-auto" href="/map">Back to the map</A>
    </div>
  </Layout>
}
