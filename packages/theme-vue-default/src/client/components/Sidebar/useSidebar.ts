import { ref } from 'vue';

const isSidebarOpen = ref(false);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useSidebar() {
  return { isSidebarOpen };
}
