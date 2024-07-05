import { Context } from 'hono';

import { encodeResponse } from './encode-result';
import { responseFactory } from './response-factory';
import { isEncodingEnabled } from './utils/is-encoding-enabled';

export function handler(handler: (body: unknown) => Promise<any>) {
  return async (c: Context) => {
    const encodingEnabled = isEncodingEnabled(c.req);
    const body = await c.req.json();

    const response = await handler(body);

    return responseFactory(encodingEnabled ? encodeResponse(response) : response);
  };
}
