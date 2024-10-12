import type { Context } from 'npm:hono';

import { encodeResponse } from './encode-result.ts';
import { responseFactory } from './response-factory.ts';
import { isEncodingEnabled } from './utils/is-encoding-enabled.ts';

export function handler(handler: (body: unknown) => Promise<any>) {
  return async (c: Context) => {
    const encodingEnabled = isEncodingEnabled(c.req);
    const body = await c.req.json();

    const response = await handler(body);

    return responseFactory(
      encodingEnabled ? encodeResponse(response) : response,
    );
  };
}
