import { A, useLocation } from "@solidjs/router";
import { useDebug } from "~/contexts/debug";

export default function NotFound() {
	const location = useLocation();
	const { debug } = useDebug();

	return (
		<main class="text-center mx-auto text-gray-700 p-4 font-serif">
			{debug.enabled ? <pre>{location.pathname}</pre> : null}
			<h1 class="max-6-xs text-6xl text-primary uppercase my-16">Not Found</h1>
			<p class="my-4">
				<A href="/" class="text-primary hover:underline">
					{" "}
					Home{" "}
				</A>
			</p>
		</main>
	);
}
