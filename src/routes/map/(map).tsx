import { A } from "@solidjs/router";
import { GameIconsCastle } from "~/components/icons/Castle";
import { GameIconsCircleForest } from "~/components/icons/CircleForest";
import Layout from "~/components/Layout";
import { CITY_NAME, FOREST_NAME } from "~/constants";

const zones = [
	{
		disabled: false,
		href: "/town",
		icon: () => <GameIconsCastle />,
		title: CITY_NAME,
	},
	{
		disabled: false,
		href: "/forest",
		icon: () => <GameIconsCircleForest />,
		title: FOREST_NAME,
	},
];

export default function MapRoute() {
	return (
		<Layout
			title="Galdiria's wilds"
			hideStatusBar
			illustration={<img class="w-full h-full object-cover" src="/backgrounds/galdiria.svg" />}
		>
			<div class="grid grid-cols-2 gap-5 overflow-y-auto scrollbar scrollbar-track-base-200 scrollbar-thumb-base-300 -m-8 p-8">
				{zones.map(zone => (
					<A
						href={zone.disabled ? "" : zone.href}
						aria-disabled={zone.disabled}
						class="btn btn-ghost aria-disabled:text-base-300! aria-disabled:bg-base-300! aria-disabled:btn-disabled hover:bg-primary hover:text-primary-content bg-base-300 w-full h-32 flex flex-col"
					>
						<span class="text-5xl">{zone.icon()}</span>
						<h1 class="text-lg">{zone.title}</h1>
					</A>
				))}
			</div>
		</Layout>
	);
}
