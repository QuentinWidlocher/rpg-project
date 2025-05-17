import { twJoin } from "tailwind-merge";
import { ActionCost, getMaxHp, InitiativeEntry, Store } from "~/game/battle/battle";
import { ActionFromRef, AnyAction } from "~/game/character/actions";
import { PlayerCharacter } from "~/game/character/character";
import { Opponent } from "~/game/character/opponents";

export type CharacterWithInitiative = InitiativeEntry & (Opponent | PlayerCharacter);

export function Initiative(props: {
	canPartyAct: boolean;
	currentPlayerHaveAction: (costs: ActionCost[]) => boolean;
	findInAllCharacter: <T extends Opponent | PlayerCharacter = Opponent | PlayerCharacter>(
		predicate: (character: Opponent | PlayerCharacter) => boolean,
	) => Store<T>;
	initiatives: InitiativeEntry[];
	onCharacterClick: (character: CharacterWithInitiative) => void;
	selectedAction: AnyAction | ActionFromRef | null;
	turn: number;
}) {
	const round = () => Math.floor(props.turn / props.initiatives.length);

	const charactersInOrder = () =>
		props.initiatives.map(
			initiative =>
				({
					...initiative,
					...props.findInAllCharacter(character => character.id == initiative.id)!.value,
				} satisfies CharacterWithInitiative),
		);

	const rotatedInitiative = () => {
		const copy = [...charactersInOrder().filter(character => character.hp.current > 0)];
		copy.push(...copy.splice(0, ((props.turn % props.initiatives.length) + copy.length) % copy.length));
		return copy;
	};

	return (
		<ul
			id="initiative"
			class="flex py-5 px-7 gap-10 overflow-visible overflow-x-auto w-full scrollbar scrollbar-track-transparent"
		>
			{[...new Array(2)].map((_, i) => (
				<>
					{(i == 0
						? rotatedInitiative().slice(0, props.initiatives.length - (props.turn % props.initiatives.length))
						: charactersInOrder().filter(character => character.hp.current > 0)
					).map((character, j) => (
						<li
							aria-disabled={
								!props.canPartyAct ||
								!props.selectedAction ||
								(props.selectedAction?.cost && !props.currentPlayerHaveAction([props.selectedAction!.cost!])) ||
								character.type != "OPPONENT"
							}
							aria-current={i == 0} // current round
							aria-selected={i == 0 && j == 0} // active character
							class="group shrink-0 radial-progress cursor-pointer aria-disabled:cursor-default text-neutral hover:aria-disabled:text-base-300 aria-disabled:text-base-300 aria-selected:text-primary! before:-inset-4"
							style={{
								"--thickness": "4px",
								"--value": (character.hp.current / getMaxHp(props.findInAllCharacter(c => c.id == character.id).value)) * 100,
							}}
							role="progressbar"
							onClick={() => props.onCharacterClick(character)}
						>
							<div class="avatar avatar-placeholder">
								<div
									class={twJoin(
										"flex flex-col text-sm mask w-24",
										"bg-neutral text-base-content",
										"dusk:text-neutral-content dusk:group-aria-disabled:text-base-content dusk:group-aria-selected:text-primary-content",
										"dawn:text-neutral-content dawn:group-aria-disabled:text-base-content dawn:group-aria-selected:text-primary-content",
										"night:text-base-100 night:group-aria-disabled:text-base-content night:group-aria-selected:text-primary-content",
										"group-aria-selected:bg-primary group-aria-selected:text-primary-content",
										"group-aria-disabled:bg-base-300",
										character.type == "OPPONENT" ? "mask-circle" : "mask-hexagon",
									)}
								>
									<span class="text-center">{character.name}</span>
									<span>{`${character.hp.current}/${getMaxHp(props.findInAllCharacter(c => c.id == character.id).value)}`}</span>
								</div>
							</div>
						</li>
					))}
					<div class="divider divider-horizontal text-base-300 -mx-3">{round() + 1 + i}</div>
				</>
			))}
			<li class="text-base-300 m-auto pr-5">...</li>
		</ul>
	);
}
