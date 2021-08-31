import type { App } from '../../App.js';
import type { ClientPluginInfo } from '../../plugin/ClientPlugin.js';
import { resolveClient } from './resolveClient.js';
import { resolvePluginsFromConfig } from './resolvePluginsFromConfig.js';

export const resolveClientInfo = async (
  app: App,
  clientName: string
): Promise<ClientPluginInfo> => {
  const client = await resolveClient(app, clientName);
  return {
    ...client,
    plugins: [client, ...(await resolvePluginsFromConfig(app, client.plugins))]
  };
};
