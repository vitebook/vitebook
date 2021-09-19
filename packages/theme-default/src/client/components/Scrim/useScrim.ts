import { Ref, ref } from 'vue';

const isScrimActive = ref(false);

export function useIsScrimActive(): Ref<boolean> {
  return isScrimActive;
}
