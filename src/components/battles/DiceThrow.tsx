import { Show, createEffect, createSignal, on } from "solid-js";
import { AttackResult } from "~/game/battle/battle";
import { d20 } from "~/utils/dice";

const emptyAttackResult: AttackResult = {
	success: false,
	details: {
		attacker: "",
		defender: "",
		attack: "",
		defenderAC: 0,
		hitRoll: 0,
		hitModifier: 0,
	},
};

export function DiceThrow(props: {
	onClose: () => void;
	values: AttackResult | null;
}) {
	const [rollingResult, setRollingResult] =
		createSignal<AttackResult>(emptyAttackResult);
	const [hitResult, setHitResult] = createSignal(0);
	const [rollDone, setRollDone] = createSignal(false);

	createEffect(
		on(
			() => props.values,
			function roll() {
				if (props.values) {
					setRollingResult(emptyAttackResult);
					setTimeout(() => {
						setRollingResult(props.values!);
					});
				}
			},
		),
	);

	createEffect(
		on(
			() => props.values,
			function roll() {
				if (props.values) {
					setTimeout(() => {
						console.debug("setRollDone(true)");
						setRollDone(true);
					}, 1000);
				} else {
					setRollDone(false);
				}
			},
		),
	);

	createEffect(() => {
		if (rollDone()) {
			console.debug("rollDone");
			setHitResult(0);
			setTimeout(() => {
				setHitResult((props.values as AttackResult & { success: true }).damage);
			}, 100);
		}
	});

	return (
		<Show when={props.values}>
			{values => (
				<div class="w-full h-full -mt-10 sm:rounded-2xl absolute bg-black/70 grid place-content-center z-10">
					<div class="card">
						<div class="card-body bg-base-100 rounded-xl text-center">
							<div class="flex mx-auto gap-1 items-center opacity-50">
								<span class="countdown text-4xl">
									<span style={{ "--value": rollingResult().details?.hitRoll }} />
								</span>
								<span class="text-4xl">+ {rollingResult().details?.hitModifier} =</span>
							</div>
							<span class="countdown text-6xl mx-auto mt-2">
								<span
									style={{
										"--value":
											rollingResult().details?.hitRoll +
											rollingResult().details.hitModifier,
									}}
								/>
							</span>
							<span>vs.</span>
							<span class="text-6xl">{values().details?.defenderAC}</span>
							{rollDone() ? (
								<button
									onClick={() => props.onClose()}
									class={`btn mt-5 btn-wide ${
										values().success ? "btn-success" : "btn-error"
									}`}
								>
									{values().success ? (
										<span class="countdown flex gap-1">
											Hit ! <span style={{ "--value": hitResult() }} /> damage inflicted
										</span>
									) : (
										"Miss..."
									)}
								</button>
							) : (
								<div class="btn-wide mt-5 btn opacity-0"></div>
							)}
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}
