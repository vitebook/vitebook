import { createContext, FunctionComponent } from 'preact';
import type { Router } from 'vue-router';

export const RouterContext = createContext<Router | undefined>(undefined);

type WithRouterProps = {
  Component: FunctionComponent;
  router: Router;
};

export function withRouter({ Component, router }: WithRouterProps) {
  return (
    <RouterContext.Provider value={router}>
      <Component />
    </RouterContext.Provider>
  );
}
