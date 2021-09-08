import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
  name: 'ClientOnly',
  setup(_, ctx) {
    const isMounted = ref(false);

    onMounted(() => {
      isMounted.value = true;
    });

    return () => (isMounted.value ? ctx.slots.default?.() : null);
  }
});
