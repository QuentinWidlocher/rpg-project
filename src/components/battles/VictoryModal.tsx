import { Show } from "solid-js";
import { AttackResult } from "~/game/battle/battle";
import { AttackResultDetailsTooltipContent } from "./Logs";

export function VictoryModal(props: {
  onClose: () => void;
  fatalAttackResult?: (AttackResult & { success: true }) | null;
  xpGained?: number;
}) {
  return <Show when={props.fatalAttackResult}>
    {fatalAttackResult => (
      <div class="w-full h-full -mt-10 sm:rounded-2xl absolute bg-black/70 grid place-content-center z-10">
        <div class="card">
          <div class="card-body bg-base-200 rounded-xl gap-10">
            <h2 class="card-title mx-auto text-2xl capitalize text-success">You were victorious.</h2>
            <span class="tooltip">
              <AttackResultDetailsTooltipContent attackResultDetails={fatalAttackResult().details} />
              {fatalAttackResult().details.attacker} defeated the {fatalAttackResult().details.defender} with their {fatalAttackResult().details.attack}
            </span>
            {props.xpGained && <span>Your prowess in battle granted your party {props.xpGained}XP</span>}
            <button class="btn btn-success" onClick={() => props.onClose()}>Exit the battle</button>
          </div>
        </div>
      </div>
    )}
  </Show>
}
