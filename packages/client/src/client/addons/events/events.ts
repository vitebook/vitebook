import debounce from 'just-debounce-it';
import throttle from 'just-throttle';
import { writable } from 'svelte/store';

import { stringifyEvent } from './stringifyEvent';

export const events = writable<Events>([]);

/**
 * @param event - The event to be logged.
 * @param whitelist - Event properties that can be included in the event log output.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function eventCallback(event: any, whitelist: string[] = []) {
  window.requestAnimationFrame(() => {
    events.update(($events) => {
      let stringifiedEvent;

      $events.push({
        id: Symbol(),
        ref: event,
        stringify: () => {
          return (
            stringifiedEvent ??
            (stringifiedEvent = stringifyEvent(event, whitelist))
          );
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

export function debouncedEventCallback(wait = 0, callFirst?: boolean) {
  // @ts-expect-error - .
  return debounce(eventCallback, wait, callFirst);
}

export type EventEntry = {
  id: symbol;
  ref: EventEntryRef;
  stringify: () => string;
};

export type EventEntryRef = Event | CustomEvent<unknown>;

export type Events = EventEntry[];
