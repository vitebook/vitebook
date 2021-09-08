import { defineComponent, h } from 'vue';
import { RouterView } from 'vue-router';

import { setPageVNodeRef } from '../composables/usePageVNode';

export default defineComponent({
  name: 'PageView',
  render() {
    return h(RouterView, null, {
      default: ({ Component }) => {
        return h(Component, {
          onVnodeMounted(node) {
            setPageVNodeRef(node);
          },
          onVnodeBeforeUnmount() {
            setPageVNodeRef(undefined);
          }
        });
      }
    });
  }
});
