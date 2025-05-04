import { Show, createEffect, createSignal, on } from "solid-js";
import { DetailedSkillCheckResult } from "~/contexts/player";
import { AttackResult } from "~/game/battle/battle";
import { BaseSkill, getSkillLabel, Skill } from "~/game/character/character";

export type SkillCheckProps = {
	skill: BaseSkill | Skill;
	dd: number;
} & DetailedSkillCheckResult;

export function SkillCheckDiceThrowModal(props: { onClose: () => void; values: SkillCheckProps | null }) {
	const [values, setValues] = createSignal<SkillCheckProps | null>(null);
	const [rollDone, setRollDone] = createSignal(false);

	const total = () => (values()?.roll ?? 0) + (values()?.modifier ?? 0) + (values()?.proficiency ?? 0);

	createEffect(
		on(
			() => [props.values],
			function roll() {
				if (props.values) {
					setValues(null);
					setTimeout(() => {
						setValues(props.values);
					}, 100);

					setRollDone(false);
					setTimeout(() => {
						setRollDone(true);
					}, 1000);
				} else {
					setValues(null);
					setRollDone(false);
				}
			},
		),
	);

	return (
		<Show when={props.values}>
			{fixedValues => (
				<div class="w-full h-full -mt-30 -ml-6 sm:rounded-2xl absolute bg-black/70 grid place-content-center z-10">
					<div class="card w-96">
						<div class="card-body bg-base-200 rounded-xl text-center">
							<h1 class="card-title mx-auto text-2xl mb-5">{getSkillLabel(fixedValues().skill)} check</h1>
							<div class="flex mx-auto gap-1 items-center opacity-50">
								<span class="countdown text-4xl">
									<span style={{ "--value": values()?.roll ?? 0 }} />
								</span>
								<span class="text-4xl">+ {fixedValues().modifier} =</span>
								{fixedValues().proficiency != 0 ? <span class="text-4xl">+ {fixedValues().proficiency} =</span> : undefined}
							</div>
							<span class="countdown text-6xl mx-auto mt-2">
								<span
									style={{
										"--value": total(),
									}}
								/>
							</span>
							<span>vs.</span>
							<span class="text-6xl">{fixedValues().dd}</span>
							<button
								onClick={() => {
									props.onClose();
								}}
								aria-hidden={!rollDone()}
								class={`aria-hidden:opacity-0 transition-opacity btn mt-5 mx-auto btn-wide ${
									total() > fixedValues().dd ? "btn-success" : "btn-error"
								}`}
							>
								{total() > fixedValues().dd ? "Embrace the success !" : "Endure the failure..."}
							</button>
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}
