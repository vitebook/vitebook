import type { CLIArgs } from '../cli/args';
import type { App } from './App';
import type { AppConfig } from './AppConfig';
import { createApp } from './create/createApp';

export async function resolveApp(
  args: CLIArgs = { '--': [], command: 'dev' },
  config?: AppConfig,
): Promise<App> {
  return createApp({
    cliArgs: args,
    ...config,
    dirs: {
      ...config?.dirs,
      ...args,
    },
    pages: {
      ...config?.pages,
      include: args.include,
    },
  });
}
