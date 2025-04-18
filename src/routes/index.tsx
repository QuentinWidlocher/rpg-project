import { Navigate } from "@solidjs/router";
import { useFlags } from "~/contexts/flags";

export default function Home() {
	const { getFlag } = useFlags();

	if (!getFlag("cutscene.intro")) {
		if (import.meta.env.DEV) {
			return <Navigate href="/debug" state={{ backTo: "/" }} />;
		} else {
			return <Navigate href="/dialog/intro" />;
		}
	} else if (!getFlag("cutscene.act0")) {
		return <Navigate href="/dialog/act0" />;
	} else {
		return <Navigate href="map" />;
	}
}
