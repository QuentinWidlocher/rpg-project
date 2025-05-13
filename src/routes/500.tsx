import { A } from "@solidjs/router";
import { isError } from "lodash-es";
import { useDebug } from "~/contexts/debug";

export default function ErrorPage(props: { error: any }) {
	const { debug } = useDebug();
	if (debug.enabled) {
		console.error(props.error);
	}
	return (
		<main class="text-center mx-auto text-gray-700 p-4 font-serif">
			{debug.enabled ? (
				isError(props.error) ? (
					<div class="overflow-y-auto">
						<h2 class="text-xl text-primary">{props.error.message}</h2>
						<details>
							<summary>Trace</summary>
							<pre class="text-left! text-gray-500">{props.error.stack}</pre>
						</details>
					</div>
				) : (
					<pre>{JSON.stringify(props.error)}</pre>
				)
			) : null}
			<h1 class="max-6-xs text-6xl text-primary uppercase my-16">Something bad happened</h1>
			<p class="my-4">
				<A href="/" class="text-primary hover:underline">
					{" "}
					Home{" "}
				</A>
			</p>
		</main>
	);
}
