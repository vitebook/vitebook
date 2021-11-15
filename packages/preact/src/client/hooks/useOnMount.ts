import { useEffect, useRef } from 'preact/hooks';

export function useOnMount() {
  const callbacks = useRef<(() => void)[]>([]);

  const onMount = useRef((callback: () => void) => {
    callbacks.current.push(callback);
  });

  useEffect(() => {
    callbacks.current.forEach((fn) => fn());
  }, []);

  return onMount.current;
}
