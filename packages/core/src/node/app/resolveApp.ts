import { resolveConfig, UserConfig } from 'vite';

import type { CLIArgs } from '../cli/args';
import type { App } from './App';
import type { AppConfig } from './AppOptions';
import { createApp } from './create/createApp';

export async function resolveApp(
  args: CLIArgs = { '--': [], command: 'dev' },
  appConfig?: AppConfig,
): Promise<App> {
  const vite = resolveConfig({}, 'build', 'does_not_matter') as UserConfig & {
    book?: AppConfig;
  };

  return createApp({
    cliArgs: args,
    ...vite?.book,
    ...appConfig,
    ...args,
  });
}
