const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export function stringifyEvent(event: Event | CustomEvent) {
  const o = {};

  const whitelist = new Set<keyof CustomEvent | keyof MouseEvent>([
    'clientX',
    'clientY',
    'timeStamp',
    'bubbles',
    'composed',
    'isTrusted',
    'CAPTURING_PHASE',
    'BUBBLING_PHASE',
    'target',
  ]);

  whitelist.forEach((prop) => {
    if (prop in event) {
      if (prop === 'target') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        o[prop] = `${(event[prop] as any).constructor.name}`;
      } else {
        o[prop] = event[prop];
      }
    }
  });

  return JSON.stringify(o, getCircularReplacer(), 2);
}
