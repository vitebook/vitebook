import {
  Component,
  defineAsyncComponent,
  markRaw,
  Ref,
  ref,
  watchEffect
} from 'vue';

export function useDynamicAsyncComponent(
  url: Ref<string | null | undefined>
): Readonly<Ref<Component | null>> {
  let prevUrl: string | null | undefined;

  const component = ref();

  watchEffect(() => {
    if (url.value === prevUrl) return;

    if (url.value) {
      component.value = markRaw(
        defineAsyncComponent(
          async () => await import(/* @vite-ignore */ url.value!)
        )
      );
    } else {
      component.value = null;
    }

    prevUrl = url.value;
  });

  return component;
}
