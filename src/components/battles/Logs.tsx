import { createEffect, on } from "solid-js";
import { twJoin } from "tailwind-merge";
import { AttackResult, getAllInitiatives } from "~/game/battle/battle";
import { IconoirCheckCircleSolid } from "../icons/CheckCircleSolid";
import { IconoirXmarkCircleSolid } from "../icons/XmarkCircleSolid";

export type Log = {
	type: ReturnType<typeof getAllInitiatives>[0]["type"];
	message: string;
	result?: AttackResult;
};

function LogEntry(props: { leftSide: boolean; current: boolean; log: Log }) {
	return (
		<div
			class={twJoin(
				props.leftSide ? "timeline-start text-start" : "timeline-end text-end",
				props.log.result && "tooltip",
				"timeline-box not-active:not-hover:opacity-50 aria-current:opacity-100!",
			)}
			aria-current={props.current}
		>
			{props.log.result && (
				<div class="tooltip-content">
					{props.log.result.details.attack} <br />
					{props.log.result.details.hitRoll + props.log.result.details.hitModifier} ({props.log.result.details.hitRoll} +{" "}
					{props.log.result.details.hitModifier}) vs. {props.log.result.details.defenderAC} <br />
					{"damageRoll" in props.log.result.details
						? `${props.log.result.details.damageRoll}${props.log.result.details.damageModifier ? ` + ${props.log.result.details.damageModifier} dmg` : ""}`
						: ""}
				</div>
			)}
			{props.log.message}
		</div>
	);
}

export function Logs(props: { logs: Log[] }) {
	let logRef: HTMLDivElement | undefined;

	createEffect(
		on(
			() => props.logs,
			function scrollToLogsBottom() {
				if (!logRef) return;

				logRef.scrollTo({ top: logRef.scrollHeight, behavior: "smooth" });
			},
		),
	);

	return (
		<div
			id="logs"
			ref={logRef}
			class="py-5 flex-1 overflow-y-scroll overflow-x-hidden scrollbar scrollbar-track-base-200 scrollbar-thumb-base-300 pl-3"
		>
			<ul class="timeline timeline-vertical h-full justify-end">
				{props.logs.map((log, index) => (
					<li>
						<hr />
						{log.type == "OPPONENT" ? <LogEntry leftSide={true} current={index == props.logs.length - 1} log={log} /> : null}
						<div class={twJoin("timeline-middle text-base-400", log.result?.success && "text-primary")}>
							{log.result?.success ? <IconoirCheckCircleSolid /> : <IconoirXmarkCircleSolid />}
						</div>
						{log.type == "PARTY" ? <LogEntry leftSide={false} current={index == props.logs.length - 1} log={log} /> : null}
						<hr />
					</li>
				))}
			</ul>
		</div>
	);
}
