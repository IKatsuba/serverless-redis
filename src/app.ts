import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { logger } from 'hono/logger';

import {
  handleCommand,
  handleCommandArray,
  handleCommandTransactionArray,
} from './lib/handle-command.ts';
import { handler } from './lib/handler.ts';
import { responseFactory } from './lib/response-factory.ts';

export interface CreateAppOptions {
  enableLogger?: boolean;
}

export function createApp(options: CreateAppOptions = {}): Hono {
  const { enableLogger = true } = options;
  const app = new Hono();

  app.use(
    '/*',
    bearerAuth({
      token: Deno.env.get('SR_TOKEN') || '',
    }),
  );

  if (enableLogger) {
    app.use(logger());
  }

  app.get('/', () =>
    responseFactory({
      status: 'ok',
      result: 'Welcome to HTTP Redis!',
    }));

  app.get('/ping', (c) => c.text('Pong'));

  app.post('/', handler(handleCommand));
  app.post('/pipeline', handler(handleCommandArray));
  app.post('/multi-exec', handler(handleCommandTransactionArray));

  return app;
}
