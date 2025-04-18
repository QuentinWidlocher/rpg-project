import { MemoryRouter, Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Show, Suspense } from "solid-js";
import "./app.css";
import Layout from "./components/Layout";
import "@fontsource-variable/platypi";
import { DebugProvider } from "./contexts/debug";
import { PlayerProvider } from "./contexts/player";
import { FlagsProvider } from "./contexts/flags";
import { ModalProvider, useModal } from "./contexts/modal";

export default function App() {
	return (
		<>
			<MemoryRouter
				root={props => (
					<DebugProvider>
						<PlayerProvider>
							<FlagsProvider>
								<ModalProvider>
									<Suspense
										fallback={
											<Layout hideStatusBar>
												<span class="m-auto loading loading-spinner text-primary loading-lg" />
											</Layout>
										}
									>
										{props.children}
									</Suspense>
								</ModalProvider>
							</FlagsProvider>
						</PlayerProvider>
					</DebugProvider>
				)}
			>
				<FileRoutes />
			</MemoryRouter>
		</>
	);
}
