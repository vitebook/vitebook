/** __APP_IMPORTS__ **/ import type { ComponentChildren } from 'preact';

type AppProps = {
  Component: ComponentChildren;
};

function App({ Component }: AppProps) {
  return <Component />;
}

App.displayName = 'VitebookApp';

export default App;
