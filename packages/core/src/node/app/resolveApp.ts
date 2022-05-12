import type { CLIArgs } from '../cli/args';
import type { App } from './App';
import type { AppConfig } from './AppOptions';
import { createApp } from './create/createApp';

export async function resolveApp(
  args: CLIArgs = { '--': [], command: 'dev' },
  appConfig?: AppConfig,
): Promise<App> {
  return createApp({
    cliArgs: args,
    ...appConfig,
    dirs: {
      ...appConfig?.dirs,
      ...args,
    },
    pages: {
      ...appConfig?.pages,
      ...args,
    },
  });
}
