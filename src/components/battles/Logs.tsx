import { createEffect, on } from "solid-js"
import { twJoin } from "tailwind-merge"
import { AttackResult, getAllInitiatives } from "~/game/battle/battle"
import { IconoirCheckCircleSolid } from "../icons/CheckCircleSolid"
import { IconoirXmarkCircleSolid } from "../icons/XmarkCircleSolid"

export type Log = AttackResult & {
  type: ReturnType<typeof getAllInitiatives>[0]['type'],
  message: string,
}

export function Logs(props: {
  logs: Log[]
}) {
  let logRef: HTMLDivElement | undefined

  createEffect(on(() => props.logs, function scrollToLogsBottom() {
    if (!logRef) return

    logRef.scrollTo({ top: logRef.scrollHeight, behavior: 'smooth' })
  }))

  return (
    <div id="logs" ref={logRef} class="py-5 flex-1 overflow-y-scroll overflow-x-hidden scrollbar scrollbar-track-base-200 scrollbar-thumb-base-300 pl-3">
      <ul class="timeline timeline-vertical h-full justify-end">
        {props.logs.map((log, index) => (
          <li>
            <hr />
            {log.type == 'OPPONENT' ? (<div
              class="timeline-start text-start timeline-box tooltip opacity-50 aria-[current=true]:opacity-100"
              aria-current={index == props.logs.length - 1}
              data-tip={`${log.details.attack}\n${log.details.hitRoll + log.details.hitModifier} (${log.details.hitRoll} + ${log.details.hitModifier}) vs. ${log.details.defenderAC} ${'damageRoll' in log.details ? (`\n${log.details.damageRoll}${log.details.damageModifier ? ` + ${log.details.damageModifier} dmg` : ''}`) : ''}`}
            >
              {log.message}
            </div>
            ) : null}
            <div class={twJoin("timeline-middle text-base-400", log.success && "text-primary")}>{log.success ? (<IconoirCheckCircleSolid />) : (<IconoirXmarkCircleSolid />)}</div>
            {log.type == 'PARTY' ? (<div
              class="timeline-end text-end timeline-box tooltip opacity-50 aria-[current=true]:opacity-100"
              aria-current={index == props.logs.length - 1}
              data-tip={`${log.details.attack}\n${log.details.hitRoll + log.details.hitModifier} (${log.details.hitRoll} + ${log.details.hitModifier}) vs. ${log.details.defenderAC} ${'damageRoll' in log.details ? (`\n${log.details.damageRoll}${log.details.damageModifier ? ` + ${log.details.damageModifier} dmg` : ''}`) : ''}`}
            >{log.message}</div>) : null}
            <hr />
          </li>
        ))}
      </ul>
    </div>

  )
}
