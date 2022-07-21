import { useEffect, useRef, useState } from 'preact/hooks';

export function useOnDestroy() {
  const [callbacks, setCallbacks] = useState<(() => void)[]>([]);

  const onDestroy = useRef((callback: () => void) => {
    if (callbacks === null) {
      setCallbacks([]);
    }

    callbacks.push(callback);
  });

  useEffect(() => {
    return () => {
      callbacks.forEach((fn) => fn());
    };
  }, []);

  return onDestroy.current;
}
