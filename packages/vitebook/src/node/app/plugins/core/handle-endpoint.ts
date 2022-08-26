import type { IncomingMessage, ServerResponse } from 'http';

import { matchRouteInfo } from '../../../../shared';
import { App } from '../../App';
import {
  handleFunctionRequest,
  handleHTTPError,
  isHTTPError,
} from '../../http';
import { getRequest, setResponse } from './http-bridge';

export async function handleEndpoint(
  base: string,
  url: URL,
  app: App,
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const match = matchRouteInfo(url, app.nodes.endpoints.toArray());

    if (!match) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    const endpoint = app.nodes.endpoints.getByIndex(match.index);

    const getClientAddress = () => {
      const { remoteAddress } = req.socket;
      if (remoteAddress) return remoteAddress;
      throw new Error('Could not determine `clientAddres`');
    };

    const response = await handleFunctionRequest(
      await getRequest(base, req),
      endpoint.route.pattern,
      getClientAddress,
      () => app.vite.server!.ssrLoadModule(endpoint.filePath),
    );

    setResponse(res, response);
  } catch (error) {
    if (isHTTPError(error)) {
      setResponse(res, handleHTTPError(error));
    } else {
      throw error;
    }
  }
}
