import { ref } from 'vue';

const isScrimActive = ref(false);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useScrim() {
  return { isScrimActive };
}
