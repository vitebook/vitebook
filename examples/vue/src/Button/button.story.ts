import { UserStory } from '@vitebook/vue';

import Button from './Button.vue';

const story: UserStory<typeof Button> = {
  name: 'Button',
  component: './Button.vue',
  variants: [
    { name: 'disabled', props: { disabled: false } },
    { name: 'loading' }
  ]
};

export default story;
