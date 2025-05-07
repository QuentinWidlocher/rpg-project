import { MemoryRouter } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import Layout from "./components/Layout";
import "@fontsource-variable/platypi";
import { DebugProvider } from "./contexts/debug";
import { PlayerProvider } from "./contexts/player";
import { FlagsProvider } from "./contexts/flags";
import { ModalOutlet, ModalProvider, useModal } from "./contexts/modal";

export default function App() {
	return (
		<>
			<MemoryRouter
				root={props => (
					<DebugProvider>
						<ModalProvider>
							<PlayerProvider>
								<FlagsProvider>
									<Suspense
										fallback={
											<Layout hideStatusBar>
												<span class="m-auto loading loading-spinner text-primary loading-lg" />
											</Layout>
										}
									>
										<ModalOutlet>{props.children}</ModalOutlet>
									</Suspense>
								</FlagsProvider>
							</PlayerProvider>
						</ModalProvider>
					</DebugProvider>
				)}
			>
				<FileRoutes />
			</MemoryRouter>
		</>
	);
}
