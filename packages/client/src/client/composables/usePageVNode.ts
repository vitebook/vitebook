import { markRaw, Ref, ref, shallowReadonly, VNode } from 'vue';

export type PageVNodeRef = Ref<VNode | undefined>;

const pageVNodeRef: PageVNodeRef = ref(undefined);

export function usePageVNode(): Readonly<PageVNodeRef> {
  return shallowReadonly(pageVNodeRef);
}

export function setPageVNodeRef(node?: VNode): void {
  pageVNodeRef.value = node ? markRaw(node) : undefined;
}
