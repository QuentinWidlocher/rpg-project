import { makePersisted } from "@solid-primitives/storage";
import { Location, useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, JSX } from "solid-js";
import { createRequiredContextProvider } from "~/utils/useRequiredContextProvider";

export type BookmarkContext = {
	bookmarkedUrl: Location;
};

export const [BookmarkProvider, useBookmark] = createRequiredContextProvider(() => {
	const location = useLocation();
	const navigate = useNavigate();
	const [bookmarkedUrl, setBookmarkedUrl] = makePersisted(createSignal(location), { name: "bookmark" });

	const navigateToBookmark = () => {
		console.debug("Navigating to bookmark", bookmarkedUrl().pathname);
		navigate(bookmarkedUrl().pathname, { state: bookmarkedUrl().state });
	};

	createEffect(function syncBookmarkedUrl() {
		if (!["/", "/500", "/404", "/debug", "/debug/flags"].includes(location.pathname)) {
			console.debug("New bookmark : ", location.pathname);
			setBookmarkedUrl(location);
		}
	});

	return {
		NavigateToBookmark: (): JSX.Element => {
			navigateToBookmark();
			return null;
		},
		bookmarkedUrl: bookmarkedUrl(),
		clearBookmark: () => setBookmarkedUrl({ hash: "", key: "", pathname: "/", query: {}, search: "", state: {} }),
		currentPageIsBookmarked: () => bookmarkedUrl().pathname == location.pathname,
		navigateToBookmark,
	};
});
