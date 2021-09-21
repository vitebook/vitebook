import { defineComponent, h, resolveComponent } from 'vue';
import { RouterView } from 'vue-router';

import { setPageVNodeRef } from '../composables/usePageVNode';

export default defineComponent({
  name: 'PageView',
  props: {
    shadow: {
      type: Boolean,
      default: false
    }
  },
  render() {
    return h(RouterView, null, {
      default: ({ Component }) => {
        const Page = h(Component, {
          onVnodeMounted(node) {
            setPageVNodeRef(node);
          },
          onVnodeBeforeUnmount() {
            setPageVNodeRef(undefined);
          }
        });

        return this.$props.shadow
          ? h(resolveComponent('shadow-root'), null, Page)
          : Page;
      }
    });
  }
});
