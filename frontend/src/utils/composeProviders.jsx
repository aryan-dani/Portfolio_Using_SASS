/**
 * composeProviders — flattens a deep stack of context providers into one component.
 *
 * Usage:
 *   const AppProviders = composeProviders(ThemeProvider, SoundProvider, ToastProvider);
 *   <AppProviders><App /></AppProviders>
 *
 * Providers are applied outer-first (first argument is the outermost wrapper).
 *
 * @param {...React.ComponentType} providers - Provider components to compose.
 * @returns {React.FC} A single component that wraps children in all providers.
 */
export function composeProviders(...providers) {
  return function ComposedProviders({ children }) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children,
    );
  };
}
