import type { FunctionalComponent, SVGAttributes } from 'vue';

declare module ':virtual/vitebook/icons/*' {
  const component: FunctionalComponent<SVGAttributes>;
  export default component;
}
