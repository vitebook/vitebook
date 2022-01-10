import { EventsAddon as SvelteEventsAddon } from '@vitebook/client/addons';
import { useEffect, useRef } from 'preact/hooks';
import type { SvelteComponent } from 'svelte';

export type EventsAddonProps = {
  title?: string;
  icon?: string;
};

function EventsAddon({ title = 'Events', icon }: EventsAddonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const component = useRef<SvelteComponent>();

  useEffect(() => {
    if (ref.current) {
      component.current?.$destroy();

      component.current = new SvelteEventsAddon({
        target: ref.current,
        props: { title, icon },
      });
    }

    return () => {
      component.current?.$destroy();
    };
  }, [ref.current, title, icon]);

  return <div ref={ref} />;
}

EventsAddon.displayName = 'EventsAddon';

export default EventsAddon;
