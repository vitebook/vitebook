/** __APP_IMPORTS__ **/ import type { ComponentChildren } from 'preact';

type AppProps = {
  component: ComponentChildren;
};

function App({ component }: AppProps) {
  return component;
}

App.displayName = 'VitebookApp';

export default App;
