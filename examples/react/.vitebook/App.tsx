import type { ReactNode } from 'react';

type AppProps = {
  component: ReactNode;
};

function App({ component }: AppProps) {
  return component;
}

App.displayName = 'VitebookApp';

export default App;
