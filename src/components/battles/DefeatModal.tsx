import { Show } from "solid-js";
import { AttackResultDetailsTooltipContent } from "./Logs";
import { AttackResult } from "~/game/battle/battle";

export function DefeatModal(props: {
	onClose: () => void;
	fatalAttackResult?: (AttackResult & { success: true }) | null;
}) {
	return (
		<Show when={props.fatalAttackResult}>
			{fatalAttackResult => (
				<div class="w-full h-full top-0 left-0 sm:rounded-2xl absolute bg-black/70 grid place-content-center z-20">
					<div class="card">
						<div class="card-body bg-base-200 rounded-xl gap-10">
							<h2 class="card-title mx-auto text-2xl capitalize text-primary">You were defeated.</h2>
							<span class="tooltip">
								<AttackResultDetailsTooltipContent attackResultDetails={fatalAttackResult().details} />
								The {fatalAttackResult().details.attacker} killed {fatalAttackResult().details.defender} with{" "}
								{fatalAttackResult().details.attack}
							</span>
							<button class="btn btn-primary" onClick={() => props.onClose()}>
								Exit the battle
							</button>
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}
