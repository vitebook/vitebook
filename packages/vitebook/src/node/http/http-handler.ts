import type { IncomingMessage, ServerResponse } from 'node:http';

import { getRequest, setResponse } from './http-bridge';

export async function handleHTTPRequest(
  base: string,
  req: IncomingMessage,
  res: ServerResponse,
  handler: (request: Request) => Promise<Response>,
  onInvalidBody?: (error: unknown) => void,
) {
  let request!: Request;

  try {
    request = await getRequest(base, req);
  } catch (error) {
    onInvalidBody?.(error);
    res.statusCode = 400;
    res.end('invalid request body');
    return;
  }

  await setResponse(res, await handler(request));
}
