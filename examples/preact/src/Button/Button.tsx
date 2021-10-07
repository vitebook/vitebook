import type { PageMeta } from '@vitebook/client';

function Button() {
  return <button>Click Me</button>;
}

Button.displayName = 'Button';

export const __pageMeta: PageMeta = {
  title: 'Button',
  description: 'My awesome button.'
};

export default Button;
