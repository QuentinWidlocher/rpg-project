import { useNavigate } from "@solidjs/router";
import { useFlags } from "~/contexts/flags";
import { Scene } from "~/game/dialog/dialog";

export const shopkeeperInfos = {
	firstName: "Naerria",
	lastName: "Thornbeef",
} as const;

export const setDefaultShopDialogConfig = (props => {
	props.setIllustration({
		background: "/backgrounds/shop.png",
		character: "/characters/shopkeeper.webp",
	});
}) satisfies Scene<any>["enterFunction"];

export default function ShopDialogs() {
	const navigate = useNavigate();
	const { getFlag } = useFlags();

	if (!getFlag("npc.shopkeeper.greeted")) {
		navigate("first-encounter");
	} else {
		navigate("second-encounter");
	}
}
