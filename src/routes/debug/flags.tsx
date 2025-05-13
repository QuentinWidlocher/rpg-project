import { A } from "@solidjs/router";
import { at } from "lodash-es";
import Layout from "~/components/Layout";
import { FlagName, useFlags } from "~/contexts/flags";
import { camelCaseToWords } from "~/utils/text";

export default function DebugFlagsRoute() {
	const { flags, setFlag, getFlag } = useFlags();

	function FlagToggle(props: { flagName: FlagName }) {
		return (
			<div class="form-control">
				<label class="label justify-start gap-5 cursor-pointer">
					<input
						type="checkbox"
						class="toggle toggle-primary"
						checked={getFlag(props.flagName)}
						onChange={e => setFlag(props.flagName, e.target.checked)}
					/>
					<span class="label-text">{camelCaseToWords(props.flagName.split(".").at(-1) ?? "flag")}</span>
				</label>
			</div>
		);
	}

	function FlagList(props: { flagName: string; depth: number }) {
		const flagNode = at(flags, props.flagName)[0];

		if (typeof flagNode == "object") {
			return (
				<li>
					<details>
						<summary class="p-3">{camelCaseToWords(props.flagName.split(".").at(-1) ?? "flag")}</summary>
						<ul class="flex flex-col gap-2">
							{Object.keys(flagNode).map(k => (
								<FlagList flagName={`${props.flagName}.${k}`} depth={props.depth + 1} />
							))}
						</ul>
					</details>
				</li>
			);
		} else {
			return (
				<li>
					<FlagToggle flagName={props.flagName as FlagName} />
				</li>
			);
		}
	}

	return (
		<Layout title="Flag editor" hideStatusBar scrollable>
			<A class="btn btn-ghost bg-base-300 btn-block mb-5" href="/debug">
				Back
			</A>
			<ul class="menu w-full">
				{Object.keys(flags).map(k => (
					<FlagList flagName={k} depth={0} />
				))}
			</ul>
		</Layout>
	);
}
