declare module ':virtual/vitebook/vue/app' {
  import { App, Component } from 'vue';

  export function configureApp(app: App): Promise<void>;

  const App: Component<{ component: Component }>;
  export default App;
}
