import { ContextProvider, ContextProviderProps, createContextProvider } from "@solid-primitives/context";
import { isNil } from "lodash-es";

export function createRequiredContextProvider<T, P extends ContextProviderProps>(
	factoryFn: (props: P) => T,
	contextName?: string,
): [provider: ContextProvider<P>, useContext: () => T] {
	const [Provider, useOptionalContext] = createContextProvider(factoryFn);

	const useRequiredContext = () => {
		const optionalContext = useOptionalContext();
		if (isNil(optionalContext)) {
			throw new Error(
				`You must use \`use${contextName ? contextName[0].toUpperCase() + contextName.slice(1) : "Something"}()\` inside ${
					contextName ? `a <${contextName[0].toUpperCase() + contextName.slice(1)}Provider/>` : "its Provider"
				}`,
			);
		}
		return optionalContext;
	};

	return [Provider, useRequiredContext];
}
