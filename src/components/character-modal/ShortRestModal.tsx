import { clamp } from "lodash-es";
import { createMemo, createSignal, Show } from "solid-js";
import { getSkillModifiers, usePlayer } from "~/contexts/player";
import { AnyAbility, getActionFromRef } from "~/game/character/actions";
import { getMaxHp } from "~/game/character/character";
import { classConfigs } from "~/game/character/classes/classes";
import { d } from "~/utils/dice";
import { milliseconds } from "~/utils/promises";

export function ShortRestModal(props: { onClose: () => void; visible: boolean }) {
	const { player, setPlayer } = usePlayer();
	const [rolling, setRolling] = createSignal(false);
	const [rolledValue, setRolledValue] = createSignal(0);
	const [restTaken, setRestTaken] = createSignal(0);

	const maxHp = createMemo(() => getMaxHp(player));
	const constModifier = createMemo(() => getSkillModifiers(player, "constitution").modifier);
	const minGainedHp = () => 1 + constModifier();
	const maxGainedHp = () => classConfigs[player.class].hitDiceType + constModifier();

	return (
		<Show when={props.visible}>
			<div class="w-full h-full sm:rounded-2xl absolute bg-black/70 grid place-content-center z-10">
				<div class="card w-96">
					<div class="card-body bg-base-200 rounded-xl gap-10">
						<h2 class="card-title mx-auto text-2xl capitalize text-primary dark:text-secondary">Short rest</h2>

						<p>
							You can spend one or more Hit Dice in a short rest, up to your maximum number of Hit Dice (which is equal to your
							level). <br /> <br />
							For each Hit Die spent, you roll the die and add your Constitution modifier to it. You regain hit points equal to
							the total.
						</p>

						<div class="flex flex-col justify-center gap-2">
							<div class="grid grid-cols-1 grid-rows-1">
								{rolling() ? (
									<>
										<progress
											class="progress h-6 w-full bg-base-300 text-success col-start-1 row-start-1"
											value={player.hp.current + rolledValue()}
											max={maxHp()}
										></progress>
										<progress
											class="progress h-6 w-full bg-transparent text-primary col-start-1 row-start-1"
											value={player.hp.current}
											max={maxHp()}
										></progress>
										<div
											style={{
												"--baseHp": clamp(player.hp.current, 0, maxHp()) + "fr",
												"--rest": clamp(maxHp() - player.hp.current - rolledValue() + constModifier(), 0, maxHp()) + "fr",
												"--rolled": clamp(rolledValue() + constModifier(), 0, maxHp()) + "fr",
											}}
											class="relative items-center grid grid-cols-[var(--baseHp)var(--rolled)var(--rest)] text-center col-start-1 row-start-1"
										>
											<span class="text-primary-content">{player.hp.current}</span>
											<span class="text-success-content">{player.hp.current + rolledValue() + constModifier()}</span>
											<span />
										</div>
									</>
								) : (
									<>
										<progress
											class="progress h-6 w-full bg-base-300 text-success/25 col-start-1 row-start-1"
											value={player.hp.current + maxGainedHp()}
											max={maxHp()}
										></progress>
										<progress
											class="progress h-6 w-full bg-transparent text-success col-start-1 row-start-1"
											value={player.hp.current + minGainedHp()}
											max={maxHp()}
										></progress>
										<progress
											class="progress h-6 w-full bg-transparent text-primary col-start-1 row-start-1"
											value={player.hp.current}
											max={maxHp()}
										></progress>
										<div
											style={{
												"--baseHp": clamp(player.hp.current, 0, maxHp()) + "fr",
												"--maxHp":
													clamp(
														maxGainedHp() - minGainedHp() - Math.max(player.hp.current + maxGainedHp() - maxHp(), 0),
														0,
														maxHp(),
													) + "fr",
												"--minHp": clamp(minGainedHp(), 0, maxHp()) + "fr",
												"--rest": clamp(maxHp() - player.hp.current - maxGainedHp(), 0, maxHp()) + "fr",
											}}
											class="relative items-center grid grid-cols-[var(--baseHp)var(--minHp)var(--maxHp)var(--rest)] text-center col-start-1 row-start-1"
										>
											<span class="text-primary-content">{player.hp.current}</span>
											<span class="text-success-content">
												{player.hp.current + minGainedHp() < maxHp() ? player.hp.current + minGainedHp() : null}
											</span>
											<span class="text-success-content">
												{player.hp.current + maxGainedHp() < maxHp() ? player.hp.current + maxGainedHp() : null}
											</span>
											<span />
										</div>
									</>
								)}
							</div>

							<span class="text-center text-xl p-5 bg-base-300 rounded-box flex justify-around">
								<div>
									<span class="text-primary dark:text-secondary">{player.hp.current}</span> +{" "}
								</div>
								<div>
									{rolling() ? (
										<span class="countdown text-2xl">
											<span class="text-success font-bold" style={{ "--value": rolledValue() + constModifier() }} />
										</span>
									) : (
										<>
											<span class="text-success-content dark:text-success font-bold">{minGainedHp()}</span>
											{" to "}
											<span class="text-success font-bold">{maxGainedHp()}</span>
										</>
									)}
								</div>
								<div>/ {maxHp()} HP</div>
							</span>
						</div>

						<div class="flex flex-col gap-2">
							{rolling() && rolledValue() ? (
								<button
									class="btn btn-success"
									onClick={() => {
										setPlayer("hp", "current", prev => Math.min(prev + rolledValue() + constModifier(), maxHp()));
										setPlayer("hitDice", prev => prev - 1);
										setRolling(false);
										setRolledValue(0);
										setRestTaken(prev => prev + 1);
									}}
								>
									Gain +{Math.min(rolledValue() + constModifier(), maxHp() - player.hp.current)}HP
								</button>
							) : (
								<button
									class="btn btn-primary"
									disabled={player.hitDice < 1}
									onClick={async () => {
										if (player.hitDice < 1) {
											return;
										}

										setRolledValue(0);
										setRolling(true);
										await milliseconds(100);
										setRolledValue(d(classConfigs[player.class].hitDiceType));
									}}
								>
									Roll a d{classConfigs[player.class].hitDiceType} + {constModifier()} ({player.hitDice} left)
								</button>
							)}
							<button
								class="btn"
								disabled={rolling()}
								onClick={() => {
									if (restTaken() > 0) {
										for (const actionRef of player.actions) {
											const action = getActionFromRef(actionRef);
											if (
												action.restoreOn != null &&
												(["any-rest", "short-rest"] satisfies AnyAbility["restoreOn"][]).includes(action.restoreOn)
											) {
												action.props.setState("usage", 0);
											}
										}
									}

									return props.onClose();
								}}
							>
								Exit
							</button>
						</div>
					</div>
				</div>
			</div>
		</Show>
	);
}
