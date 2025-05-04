import { opponentTemplates } from "~/game/opponents/monsters";

export const act0Opponent = "bandit" as const satisfies keyof typeof opponentTemplates;
