import type { PageMeta } from '@vitebook/client';
import { Variant } from '@vitebook/preact';
import {
  ControlsAddon,
  eventCallback,
  EventsAddon,
} from '@vitebook/preact/addons';
import { useState } from 'preact/hooks';

import Button from './Button';

export const __pageMeta: PageMeta = {
  title: 'Button',
  description: 'My awesome button.',
};

function ButtonStory() {
  const [title, setTitle] = useState('Click Me');
  const [disabled, setDisabled] = useState(false);

  return (
    <>
      <Variant name="Default" description="The default button.">
        <Button disabled={disabled} onClick={eventCallback}>
          {title}
        </Button>
      </Variant>

      <Variant
        name="Disabled"
        description="The disabled button."
        onEnter={() => {
          disabled = true;
        }}
        onExit={() => {
          disabled = false;
        }}
      >
        <Button disabled={disabled}>{title}</Button>
      </Variant>

      <ControlsAddon>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target?.value)}
          />
        </label>
        <label style={{ marginTop: '24px' }}>
          Disabled
          <input
            type="checkbox"
            checked={disabled}
            onChange={(e) => setDisabled(e.target?.checked)}
          />
        </label>
      </ControlsAddon>

      <EventsAddon />
    </>
  );
}

ButtonStory.displayName = 'ButtonStory';

export default ButtonStory;
