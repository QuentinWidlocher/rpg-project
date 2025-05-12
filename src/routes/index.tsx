import { Navigate } from "@solidjs/router";
import { ErrorBoundary } from "solid-js";
import { useBookmark } from "~/contexts/bookmark";
import { useFlags } from "~/contexts/flags";

export default function Index() {
	return (
		<ErrorBoundary
			fallback={(error, reset) => (
				<div role="alert" class="alert alert-error alert-soft">
					<pre>{JSON.stringify(error, null, 2)}</pre>
					<button class="btn" onClick={() => reset()}>
						Reset
					</button>
				</div>
			)}
		>
			<Home />
		</ErrorBoundary>
	);
}

function Home() {
	const { getFlag } = useFlags();
	const { currentPageIsBookmarked, NavigateToBookmark } = useBookmark();

	if (!currentPageIsBookmarked()) {
		return <NavigateToBookmark />;
	}

	if (!getFlag("cutscene.intro")) {
		return <Navigate href="/dialog/intro" />;
	} else if (!getFlag("cutscene.act0")) {
		return <Navigate href="/dialog/act0" />;
	} else {
		return <Navigate href="/town" />;
	}
}
