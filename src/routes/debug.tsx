import { A, useLocation } from "@solidjs/router";
import Layout from "~/components/Layout";
import { DebugContext, useDebug } from "~/contexts/debug";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { serializedFighter } from "~/utils/characterCreation";

function camelCaseToWords(s: string) {
	const result = s.replace(/([A-Z])/g, " $1");
	return result.charAt(0).toUpperCase() + result.slice(1);
}

export default function DebugPage() {
	const { state } = useLocation<{ backTo: string }>();
	const { debug, setDebug } = useDebug();
	const { setPlayer } = usePlayer();
	const { setFlag } = useFlags();

	function DebugBoolean(props: { key: keyof DebugContext; label?: string }) {
		return (
			<div class="form-control">
				<label class="label justify-start gap-5 cursor-pointer">
					<input
						type="checkbox"
						class="toggle toggle-primary"
						checked={debug[props.key]}
						onChange={e => setDebug(props.key, e.target.checked)}
					/>
					<span class="label-text">
						{props.label ?? camelCaseToWords(props.key)}
					</span>
				</label>
			</div>
		);
	}

	return (
		<Layout title="Debug menu">
			<div class="h-full flex flex-col">
				<ul class="flex flex-col gap-5">
					<li>
						<DebugBoolean key="showStatusBar" />
					</li>
					<li>
						<DebugBoolean key="skipCharacterCreation" />
					</li>
					<li>
						<button
							onClick={() => {
								if (window.confirm("Are you sure ?")) {
									localStorage.clear();
									window.location.href = "/"; // hard ugly refresh, we don't care !!
								}
							}}
							class="btn btn-error btn-outline btn-block"
						>
							🚨 Delete all stored data 🚨
						</button>
					</li>
				</ul>

				{state?.backTo ? (
					<A
						class="btn btn-ghost bg-base-300 btn-block mt-auto"
						onClick={() => {
							if (debug.skipCharacterCreation) {
								setPlayer(serializedFighter);
								setFlag("cutscene.intro");
							}
						}}
						href={state.backTo}
					>
						Back
					</A>
				) : (
					<A class="btn btn-ghost bg-base-300 btn-block mt-auto" href="/map">
						Back to the map
					</A>
				)}
			</div>
		</Layout>
	);
}
