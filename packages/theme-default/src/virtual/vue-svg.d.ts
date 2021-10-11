import type { FunctionalComponent, SVGAttributes } from 'vue';

declare module ':virtual/vitebook/*.svg' {
  const component: FunctionalComponent<SVGAttributes>;
  export default component;
}
