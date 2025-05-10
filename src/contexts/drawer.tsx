import {
	Accessor,
	JSXElement,
	Owner,
	ParentProps,
	Setter,
	createContext,
	createSignal,
	getOwner,
	runWithOwner,
	useContext,
} from "solid-js";

export const DrawerContext = createContext<{
	visible: Accessor<boolean>;
	setVisible: Setter<boolean>;
	content: Accessor<JSXElement | null>;
	setContent: (content: JSXElement | null) => void;
	open: (content?: () => JSXElement) => void;
	close: () => void;
	setOwner: (owner: Owner | null) => void;
}>();

export function DrawerProvider(props: ParentProps) {
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
		<DrawerContext.Provider value={{ close, content, open, setContent, setOwner, setVisible, visible }}>
			{props.children}
		</DrawerContext.Provider>
	);
}

export function DrawerOutlet(props: ParentProps) {
	const { visible, content, close } = useDrawer();

	return (
		<div class="drawer drawer-end">
			<input id="my-drawer" type="checkbox" class="drawer-toggle" checked={visible()} />
			<div class="drawer-content">{props.children}</div>
			<div class="drawer-side z-30">
				<button onClick={() => close()} class="drawer-overlay"></button>
				<aside class="bg-base-100 min-h-full max-w-3/4 p-5">{content()}</aside>
			</div>
		</div>
	);
}

export function useDrawer() {
	const owner = getOwner();
	const context = useContext(DrawerContext);

	context?.setOwner(owner);

	if (context == null) {
		throw new Error("You must use `useDrawer` inside a `<DrawerProvider/>`");
	}

	return context;
}
