import { A, useLocation } from "@solidjs/router";
import Layout from "~/components/Layout";
import { DebugContext, useDebug } from "~/contexts/debug";
import { useFlags } from "~/contexts/flags";
import { usePlayer } from "~/contexts/player";
import { serializedFighter } from "~/utils/characterCreation";
import { gc } from "~/utils/currency";
import { camelCaseToWords } from "~/utils/text";

export default function DebugPage() {
	const { state } = useLocation<{ backTo: string }>();
	const { debug, setDebug } = useDebug();
	const { player, setPlayer } = usePlayer();
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
					<span class="label-text">{props.label ?? camelCaseToWords(props.key)}</span>
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
						<DebugBoolean key="showDebugChallenges" />
					</li>
					<li>
						<A href="flags" class="btn btn-info btn-block">
							Edit flags
						</A>
					</li>
					<li>
						<button
							onClick={() => {
								if (window.confirm("Are you sure ?")) {
									setPlayer(serializedFighter);
									setPlayer("money", gc(10));
									setFlag("act0.defeatedTheBandit");
									setFlag("act0.helpedTheOldMan");
									setFlag("cutscene.intro");
									setFlag("cutscene.act0");
									setFlag("cutscene.arena");
									setFlag("npc.inn.greeted");
									setFlag("npc.inn.gotName");
									setFlag("npc.inn.restedOnce");
									setFlag("npc.shopkeeper.greeted");
									setFlag("npc.shopkeeper.gotName");
									window.location.href = "/"; // hard ugly refresh, we don't care !!
								}
							}}
							class="btn btn-block"
						>
							Reset and fast forward to town
						</button>
					</li>
					<li>
						<button
							class="btn btn-block"
							onClick={() => {
								setPlayer("xp", "current", prev => (isFinite(player.xp.next) ? player.xp.next : prev));
							}}
						>
							Gain a level
						</button>
					</li>
					<li>
						<button
							onClick={() => {
								if (window.confirm("Are you sure ?")) {
									setPlayer(serializedFighter);
								}
							}}
							class="btn btn-block"
						>
							Reset player to lvl1 default fighter
						</button>
					</li>
					<li>
						<button
							onClick={() => {
								if (window.confirm("Are you sure ?")) {
									localStorage.clear();
									window.location.href = "/"; // hard ugly refresh, we don't care !!
								}
							}}
							class="btn btn-danger btn-soft btn-block"
						>
							🚨 Delete all stored data 🚨
						</button>
					</li>
				</ul>

				{state?.backTo ? (
					<A class="btn btn-ghost bg-base-300 btn-block mt-auto" href={state.backTo}>
						Back
					</A>
				) : (
					<A class="btn btn-ghost bg-base-300 btn-block mt-auto" href="/town">
						Back to the town
					</A>
				)}
			</div>
		</Layout>
	);
}
