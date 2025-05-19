import { JSXElement, ParentProps } from "solid-js";
import { twJoin } from "tailwind-merge";
import Illustration from "./Illustration";
import TitleBox from "./TitleBox";
import StatusBar from "./StatusBar";
import { useTheme } from "~/contexts/theme";

export default function Layout(
	props: ParentProps<{
		illustration?: JSXElement;
		title?: string;
		hideStatusBar?: boolean;
		compact?: boolean;
		scrollable?: boolean;
	}>,
) {
	const { theme } = useTheme();

	return (
		<div data-theme={theme.value} class="bg-base-100 h-dvh w-screen flex place-content-center sm:p-5 font-serif">
			<main class="@container relative bg-base-200 shadow-lg shadow-base-300/25 w-full min-h-full sm:w-[30rem] card rounded-none sm:rounded-2xl">
				{props.hideStatusBar ? null : <StatusBar transparent={props.illustration != null} />}
				{props.illustration ? (
					<figure class={twJoin("shadow-xl overflow-visible", !props.hideStatusBar ? "-mt-5" : null)}>
						<Illustration>{props.illustration}</Illustration>
					</figure>
				) : null}
				{props.title ? <TitleBox title={props.title} /> : null}
				<div
					class={twJoin(
						"card-body bg-base-200 rounded-b-none sm:rounded-b-xl overflow-x-hidden",
						props.scrollable ? "overflow-y-auto" : "overflow-y-hidden",
						props.hideStatusBar && !props.illustration ? "rounded-t-xl" : null,
						props.compact ? "p-0" : null,
					)}
				>
					{props.children}
				</div>
			</main>
		</div>
	);
}
