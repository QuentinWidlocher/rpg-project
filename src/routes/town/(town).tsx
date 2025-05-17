import { A } from "@solidjs/router";
import Layout from "~/components/Layout";
import { GameIconsCastle } from "~/components/icons/Castle";
import { GameIconsCauldron } from "~/components/icons/Cauldron";
import { GameIconsCrossedSwords } from "~/components/icons/CrossedSwords";
import { IconoirSettings } from "~/components/icons/Settings";
import { GameIconsShop } from "~/components/icons/Shop";
import { GameIconsTavernSign } from "~/components/icons/TavernSign";
import { GameIconsTreasureMap } from "~/components/icons/TreasureMap";
import { CITY_NAME } from "~/constants";
import { useDebug } from "~/contexts/debug";

export default function TownRoute() {
	const { debug } = useDebug();

	const zones = [
		{
			href: "/inn",
			icon: () => <GameIconsTavernSign />,
			title: "Inn",
			visible: true,
		},
		{
			href: "/dialog/shop",
			icon: () => <GameIconsShop />,
			title: "Shop",
			visible: true,
		},
		{
			href: "/castle",
			icon: () => <GameIconsCastle />,
			title: "Castle",
			visible: false,
		},
		{
			href: "/arena",
			icon: () => <GameIconsCrossedSwords />,
			title: "Arena",
			visible: true,
		},
		{
			href: "/map",
			icon: () => <GameIconsTreasureMap />,
			title: "Explore the wilds",
			visible: true,
		},
		{
			href: "/market",
			icon: () => <GameIconsCauldron />,
			title: "Brewer",
			visible: false,
		},
		{
			href: "/debug",
			icon: () => <IconoirSettings />,
			title: "Debug Menu",
			visible: debug.enabled,
		},
	];

	return (
		<>
			<Layout title={CITY_NAME} illustration={<img class="w-full h-full object-cover" src="/backgrounds/town.webp" />}>
				<div class="grid grid-cols-2 gap-5 overflow-y-auto scrollbar scrollbar-track-base-200 scrollbar-thumb-base-300 -m-8 p-8">
					{zones
						.filter(zone => zone.visible)
						.map(zone => (
							<A
								href={zone.href}
								class="btn btn-ghost aria-disabled:text-base-300! aria-disabled:bg-base-300! aria-disabled:btn-disabled hover:bg-primary hover:text-primary-content bg-base-300 w-full h-32 flex flex-col"
							>
								<span class="text-5xl">{zone.icon()}</span>
								<h1 class="text-lg">{zone.title}</h1>
							</A>
						))}
				</div>
			</Layout>
		</>
	);
}
