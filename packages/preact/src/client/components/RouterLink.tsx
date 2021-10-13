import { useCallback, useContext } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';

import { RouterContext } from '../withRouter';

export interface RouterLinkProps {
  to: string;
  replace: boolean;
  children: JSXInternal.Element;
}

function RouterLink({
  to,
  replace,
  children,
  ...props
}: RouterLinkProps): JSXInternal.Element {
  const router = useContext(RouterContext);

  const onClick = useCallback((event: Event) => {
    event.preventDefault();
  }, []);

  const onPointerDown = useCallback(() => {
    if (replace) {
      router?.replace(to);
    } else {
      router?.push(to);
    }
  }, []);

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      onPointerDown();
    }
  }, []);

  return (
    <a
      href={to}
      {...props}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      {children}
    </a>
  );
}

RouterLink.displayName = 'RouterLink';

export default RouterLink;
