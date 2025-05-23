import {
	Accessor,
	JSXElement,
	Owner,
	ParentProps,
	Setter,
	Show,
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
		<ModalContext.Provider value={{ close, content, open, setContent, setOwner, setVisible, visible }}>
			{props.children}
		</ModalContext.Provider>
	);
}

export function ModalOutlet(props: ParentProps) {
	const { visible, content } = useModal();

	return (
		<>
			<div class={twJoin(visible() ? "hidden" : "visible")}>{props.children}</div>
			<Show when={visible() && content()} fallback={<div id="no-modal" />}>
				{content => (
					<div id="modal" class="fixed top-0 left-0 w-screen h-dvh flex justify-center items-center font-serif">
						{content()}
					</div>
				)}
			</Show>
		</>
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
