import { ItemTemplate } from "./items";
import { sc, gc, cc } from "~/utils/currency";

export const basicItems = {
	boarHide: { name: "Boar hide", type: "basic", value: gc(2) },
	boarTusk: { name: "Boar tusk", type: "basic", value: sc(3) },
	celandine: { name: "Celandine", type: "basic", value: cc(1) },
	deerAntlers: { name: "Deer antler", type: "basic", value: sc(1) },
	hemlock: { name: "Hemlock", type: "basic", value: cc(1) },
	nettle: { name: "Nettle", type: "basic", value: cc(1) },
	sage: { name: "Sage", type: "basic", value: cc(1) },
} satisfies Record<string, ItemTemplate>;
