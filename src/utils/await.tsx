import { createAsync } from "@solidjs/router";
import { Accessor, JSXElement, Show, Suspense } from "solid-js";

export function Await<T>(props: {
	resolve: Promise<T>;
	children: (value: Accessor<T>) => JSXElement;
	fallback?: JSXElement;
}) {
	const data = createAsync(() => props.resolve);

	const condition = () => <Show when={data()}>{data => props.children(data)}</Show>;

	if (props.fallback != null) {
		return <Suspense fallback={props.fallback}>{condition()}</Suspense>;
	} else {
		return condition();
	}
}
