import { useEffect, useRef } from 'preact/hooks';

export function useOnDestroy() {
  const callbacks = useRef<(() => void)[]>(null);

  const onDestroy = useRef((callback: () => void) => {
    if (callbacks.current === null) {
      callbacks.current = [];
    }

    callbacks.current!.push(callback);
  });

  useEffect(() => {
    return () => {
      callbacks.current?.forEach((fn) => fn());
    };
  }, []);

  return onDestroy.current;
}
