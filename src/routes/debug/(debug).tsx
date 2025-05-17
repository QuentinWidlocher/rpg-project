import { A, useLocation, useNavigate } from "@solidjs/router";
import { twJoin } from "tailwind-merge";
import { ConditionalKeys } from "type-fest";
import { LucideClock } from "~/components/icons/Clock";
import { LucideMoon } from "~/components/icons/Moon";
import { LucideSunMedium } from "~/components/icons/Sun";
import { LucideSunrise } from "~/components/icons/Sunrise";
import { LucideSunset } from "~/components/icons/Sunset";
import Layout from "~/components/Layout";
import { useDebug } from "~/contexts/debug";
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
	const navigate = useNavigate();

	function DebugBoolean(props: { key: ConditionalKeys<typeof debug, boolean>; label?: string }) {
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
						<DebugBoolean key="showDebugChallenges" />
					</li>
					<li class="flex justify-between gap-5">
						<button
							class={twJoin("btn btn-circle ", debug.forcedTheme == "dawn" ? "btn-primary" : "btn-neutral")}
							onClick={() => setDebug("forcedTheme", "dawn")}
						>
							<LucideSunrise />
						</button>
						<button
							class={twJoin("btn btn-circle ", debug.forcedTheme == "day" ? "btn-primary" : "btn-neutral")}
							onClick={() => setDebug("forcedTheme", "day")}
						>
							<LucideSunMedium />
						</button>
						<button
							class={twJoin("btn btn-circle ", debug.forcedTheme == "dusk" ? "btn-primary" : "btn-neutral")}
							onClick={() => setDebug("forcedTheme", "dusk")}
						>
							<LucideSunset />
						</button>
						<button
							class={twJoin("btn btn-circle ", debug.forcedTheme == "night" ? "btn-primary" : "btn-neutral")}
							onClick={() => setDebug("forcedTheme", "night")}
						>
							<LucideMoon />
						</button>
						<button
							class={twJoin("btn btn-circle ", debug.forcedTheme == null ? "btn-primary" : "btn-neutral")}
							onClick={() => setDebug("forcedTheme", null)}
						>
							<LucideClock />
						</button>
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
									setFlag("cutscene.characterCreation");
									setFlag("cutscene.act0");
									setFlag("cutscene.arena");
									setFlag("npc.inn.greeted");
									setFlag("npc.inn.gotName");
									setFlag("npc.inn.restedOnce");
									setFlag("npc.shopkeeper.greeted");
									setFlag("npc.shopkeeper.gotName");
									navigate("/town");
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
									localStorage.clear();
									setFlag("cutscene.characterCreation");
									setPlayer(serializedFighter);
									window.location.href = "/"; // hard ugly refresh, we don't care !!
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

				<A class="btn btn-ghost bg-base-300 btn-block mt-auto" href={state?.backTo ?? "/"}>
					Back
				</A>
			</div>
		</Layout>
	);
}
