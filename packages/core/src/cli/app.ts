import type { App } from '../app/App.js';
import type { AppConfig } from '../app/AppOptions.js';
import { createApp } from '../app/create/createApp.js';
import { resolveConfigPath } from '../app/create/resolveConfigPath.js';
import { loadModule } from '../utils/module.js';
import { resolveRelativePath } from '../utils/path.js';
import type { CLIArgs } from './args.js';

export async function resolveApp(
  args: CLIArgs,
  appConfig?: AppConfig
): Promise<App> {
  const config = appConfig ?? (await resolveUserAppConfig(args));
  return createApp(
    {
      ...config,
      cliArgs: args,
      cwd: args.cwd ?? config.cwd,
      srcDir: args.srcDir ?? config.srcDir,
      publicDir: args.publicDir ?? config.publicDir,
      cacheDir: args.cacheDir ?? config.cacheDir,
      configDir: args.configDir ?? config.configDir,
      pages: args.pages ?? config.pages,
      debug: args.debug ?? config.debug,
      ...{
        site: {
          ...(config.site ?? {}),
          baseUrl: args.baseUrl ?? config.site?.baseUrl
        },
        vite: {
          ...(config.vite ?? {}),
          clearScreen: args.clearScreen ?? config.vite?.clearScreen ?? false,
          mode: args.mode ?? config.vite?.mode,
          server: {
            ...(config.vite?.server ?? {}),
            https: args.https ?? config.vite?.server?.https,
            host: args.host ?? config.vite?.server?.host,
            port: args.port ?? config.vite?.server?.port,
            cors: args.cors ?? config.vite?.server?.cors,
            strictPort: args.strictPort ?? config.vite?.server?.strictPort,
            open: args.open ?? config.vite?.server?.open
          }
        }
      }
    },
    {
      command: args.command === 'build' ? 'build' : 'serve',
      isDev: args.command === 'dev',
      mode: args.mode ?? config.vite?.mode
    }
  );
}

export async function resolveUserAppConfig(args: CLIArgs): Promise<AppConfig> {
  const cwd = resolveRelativePath(process.cwd(), args.cwd ?? '');
  const configDir = resolveRelativePath(cwd, args.configDir ?? '.vitebook');
  const configPath = resolveConfigPath(configDir);

  return configPath
    ? (await loadModule<{ default: AppConfig }>(configPath, { cache: false }))
        .default ?? {}
    : {};
}
