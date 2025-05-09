import { A } from "@solidjs/router";
import Layout from "~/components/Layout";
import { GameIconsCrossedSwords } from "~/components/icons/CrossedSwords";
import { IconoirSettings } from "~/components/icons/Settings";
import { GameIconsShop } from "~/components/icons/Shop";
import { GameIconsTavernSign } from "~/components/icons/TavernSign";
import { GameIconsTreasureMap } from "~/components/icons/TreasureMap";

const zones = [
	{
		disabled: false,
		href: "/inn",
		icon: () => <GameIconsTavernSign />,
		title: "Inn",
	},
	{
		disabled: false,
		href: "/dialog/shop",
		icon: () => <GameIconsShop />,
		title: "Shop",
	},
	// {
	// 	disabled: true,
	// 	icon: () => <GameIconsCastle />,
	// 	href: "/castle",
	// 	title: "Castle",
	// },
	{
		disabled: false,
		href: "/arena",
		icon: () => <GameIconsCrossedSwords />,
		title: "Arena",
	},
	{
		disabled: false,
		href: "/map",
		icon: () => <GameIconsTreasureMap />,
		title: "Explore the wilds",
	},
	// {
	// 	disabled: true,
	// 	icon: () => <GameIconsCauldron />,
	// 	href: "/market",
	// 	title: "Brewer",
	// },
	{
		disabled: false,
		href: "/debug",
		icon: () => <IconoirSettings />,
		title: "Debug Menu",
	},
];

export default function TownRoute() {
	return (
		<>
			<Layout
				title="Upper City"
				illustration={<img class="w-full h-full object-cover" src="https://artfiles.alphacoders.com/132/132525.jpg" />}
			>
				<div class="grid grid-cols-2 gap-5 overflow-y-auto scrollbar scrollbar-track-base-200 scrollbar-thumb-base-300 -m-8 p-8">
					{zones.map(zone => (
						<A
							href={zone.disabled ? "" : zone.href}
							aria-disabled={zone.disabled}
							class="btn btn-ghost aria-disabled:text-base-400! aria-disabled:bg-base-300! aria-disabled:btn-disabled hover:bg-primary hover:text-primary-content bg-base-300 w-full h-32 flex flex-col"
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
