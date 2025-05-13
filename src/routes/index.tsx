import { Navigate } from "@solidjs/router";
import { useBookmark } from "~/contexts/bookmark";
import { useFlags } from "~/contexts/flags";

export default function Home() {
	const { getFlag } = useFlags();
	const { currentPageIsBookmarked, NavigateToBookmark } = useBookmark();

	if (!currentPageIsBookmarked()) {
		return <NavigateToBookmark />;
	}

	if (!getFlag("cutscene.intro")) {
		console.log("intro");
		return <Navigate href="/dialog/intro" />;
	} else if (!getFlag("cutscene.act0")) {
		console.log("act0");
		return <Navigate href="/dialog/act0" />;
	} else {
		console.log("town");
		return <Navigate href="/town" />;
	}
}
