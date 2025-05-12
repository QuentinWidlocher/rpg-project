import { ContextProvider, ContextProviderProps, createContextProvider } from "@solid-primitives/context";
import { isNil } from "lodash-es";

export function createRequiredContextProvider<T, P extends ContextProviderProps>(
	factoryFn: (props: P) => T,
): [provider: ContextProvider<P>, useContext: () => T] {
	const [Provider, useOptionalContext] = createContextProvider(factoryFn);

	const useRequiredContext = () => {
		const optionalContext = useOptionalContext();
		if (isNil(optionalContext)) {
			throw new Error(`You must use \`${factoryFn.constructor.name}\` inside its Provider`);
		}
		return optionalContext;
	};

	return [Provider, useRequiredContext];
}
