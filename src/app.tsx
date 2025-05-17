import "@fontsource-variable/platypi";
import { MemoryRouter } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense } from "solid-js";
import "./app.css";
import { MultiProvider } from "@solid-primitives/context";
import Layout from "./components/Layout";
import { DebugProvider } from "./contexts/debug";
import { FlagsProvider } from "./contexts/flags";
import { ModalOutlet, ModalProvider } from "./contexts/modal";
import { PlayerProvider } from "./contexts/player";
import { DrawerOutlet, DrawerProvider } from "./contexts/drawer";
import { BookmarkProvider } from "./contexts/bookmark";
import ErrorPage from "./routes/500";
import { ThemeProvider } from "./contexts/theme";

export default function App() {
	return (
		<MemoryRouter
			root={props => (
				<MultiProvider
					values={[
						ThemeProvider,
						DebugProvider,
						BookmarkProvider,
						ModalProvider,
						DrawerProvider,
						PlayerProvider,
						FlagsProvider,
					]}
				>
					<ErrorBoundary fallback={e => <ErrorPage error={e} />}>
						<Suspense
							fallback={
								<Layout hideStatusBar>
									<span class="m-auto loading loading-spinner text-primary loading-lg" />
								</Layout>
							}
						>
							<ModalOutlet>
								<DrawerOutlet>{props.children}</DrawerOutlet>
							</ModalOutlet>
						</Suspense>
					</ErrorBoundary>
				</MultiProvider>
			)}
		>
			<FileRoutes />
		</MemoryRouter>
	);
}
