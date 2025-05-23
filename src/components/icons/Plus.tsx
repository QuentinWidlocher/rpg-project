import { JSX } from "solid-js";

export function IconoirPlus(props: JSX.IntrinsicElements["svg"]) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
			<path
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M6 12h6m6 0h-6m0 0V6m0 6v6"
			/>
		</svg>
	);
}
