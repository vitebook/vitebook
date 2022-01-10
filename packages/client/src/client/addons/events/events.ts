import { writable } from 'svelte/store';

import { stringifyEvent } from './stringifyEvent';

export const events = writable<Events>([]);

export function eventCallback(event: EventEntryRef) {
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

export type EventEntry = {
  id: symbol;
  ref: EventEntryRef;
  stringify: () => string;
};

export type EventEntryRef = Event | CustomEvent<unknown>;

export type Events = EventEntry[];
