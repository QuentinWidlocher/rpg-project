import {
	Accessor,
	JSXElement,
	Owner,
	ParentProps,
	Setter,
	Show,
	children,
	createContext,
	createSignal,
	getOwner,
	runWithOwner,
	useContext,
} from "solid-js";
import { twJoin } from "tailwind-merge";

export const ModalContext = createContext<{
	visible: Accessor<boolean>;
	setVisible: Setter<boolean>;
	content: Accessor<JSXElement | null>;
	setContent: (content: JSXElement | null) => void;
	open: (content?: () => JSXElement) => void;
	close: () => void;
	setOwner: (owner: Owner | null) => void;
}>();

export function ModalProvider(props: ParentProps) {
	const [visible, setVisible] = createSignal(false);
	const [owner, setOwner] = createSignal<Owner | null>(null);
	const [content, setContent] = createSignal<JSXElement | null>(null);

	const displayed = () => visible() && content() != null;

	function open(content?: () => JSXElement) {
		if (content != null) {
			setContent(runWithOwner(owner(), () => content()));
		}

		setVisible(true);
	}

	function close() {
		setVisible(false);
	}

	return (
		<ModalContext.Provider value={{ visible, setVisible, content, setContent, open, close, setOwner }}>
			<div class={twJoin(displayed() ? "hidden" : "visible")}>{props.children}</div>
			<Show when={visible() && content()}>
				{content => <div class="fixed top-0 left-0 w-screen h-dvh flex justify-center items-center">{content()}</div>}
			</Show>
		</ModalContext.Provider>
	);
}

export function useModal() {
	const owner = getOwner();
	const context = useContext(ModalContext);

	context?.setOwner(owner);

	if (context == null) {
		throw new Error("You must use `useModal` inside a `<ModalProvider/>`");
	}

	return context;
}
