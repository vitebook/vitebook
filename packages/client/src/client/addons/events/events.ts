import throttle from 'just-throttle';
import { writable } from 'svelte/store';

import { stringifyEvent } from './stringifyEvent';

export const events = writable<Events>([]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function eventCallback(event: any) {
  window.requestAnimationFrame(() => {
    events.update(($events) => {
      let stringifiedEvent;

      $events.push({
        id: Symbol(),
        ref: event,
        stringify: () => {
          return stringifiedEvent ?? (stringifiedEvent = stringifyEvent(event));
        },
      });

      return $events.sort((a, b) => b.ref.timeStamp - a.ref.timeStamp);
    });
  });
}

export function throttledEventCallback(
  interval = 0,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  },
) {
  return throttle(eventCallback, interval, options);
}

export type EventEntry = {
  id: symbol;
  ref: EventEntryRef;
  stringify: () => string;
};

export type EventEntryRef = Event | CustomEvent<unknown>;

export type Events = EventEntry[];
