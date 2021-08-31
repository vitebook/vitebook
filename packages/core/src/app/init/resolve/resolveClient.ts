import kleur from 'kleur';

import { formatErrorMsg, logger } from '../../../utils/logger.js';
import { requireResolve } from '../../../utils/module.js';
import { path } from '../../../utils/path.js';
import { normalizePackageName } from '../../../utils/pkg.js';
import type { App } from '../../App.js';
import {
  ClientPluginConfig,
  ClientPluginObject,
  NO_CLIENT_PLUGIN
} from '../../plugin/ClientPlugin.js';
import { resolvePlugin } from './resolvePlugin.js';

/**
 * Resolve a client according to the client name.
 */
export const resolveClient = async (
  app: App,
  clientName: string
): Promise<ClientPluginObject> => {
  if (
    !clientName ||
    // @ts-expect-error - string/symbol comparison will always be `false` but name will be a symbol
    // in this specific case.
    clientName === NO_CLIENT_PLUGIN
  ) {
    throw logger.createError(
      formatErrorMsg(
        `no client was found, set the ${kleur.bold(
          'client'
        )} app configuration option.\n\n[${kleur.cyan(
          path.relative(app.dirs.cwd.resolve(), app.dirs.config.resolve()) +
            '/config'
        )}]\n\n{\n  // ...\n\n  client: ['@vitebook/vue', {}]\n}`
      )
    );
  }

  const clientEntry = requireResolve(
    path.isAbsolute(clientName)
      ? clientName
      : normalizePackageName(clientName, 'vitebook', 'client')
  );

  if (clientEntry === null) {
    throw logger.createError(
      formatErrorMsg(`client not found: ${kleur.bold(clientName)}`)
    );
  }

  const client = await resolvePlugin<ClientPluginConfig, ClientPluginObject>(
    app,
    clientEntry,
    app.options.client[1] ?? {}
  );

  return client;
};
