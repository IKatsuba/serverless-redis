import { Hono } from 'npm:hono';
import { bearerAuth } from 'npm:hono/bearer-auth';
import { logger } from 'npm:hono/logger';

import {
  handleCommand,
  handleCommandArray,
  handleCommandTransactionArray,
} from './lib/handle-command.ts';
import { handler } from './lib/handler.ts';
import { redisClient } from './lib/redis-client.ts';
import { responseFactory } from './lib/response-factory.ts';

const app = new Hono();

app.use(
  '/*',
  bearerAuth({
    token: Deno.env.get('SR_TOKEN') || '',
  }),
);
app.use(logger());

app.get('/', () =>
  responseFactory({
    status: 'ok',
    result: 'Welcome to HTTP Redis!',
  }));

app.get('/ping', (c) => c.text('Pong'));

app.post('/', handler(handleCommand));
app.post('/pipeline', handler(handleCommandArray));
app.post('/multi-exec', handler(handleCommandTransactionArray));

const server = Deno.serve(
  {
    port: Number(Deno.env.get('PORT')) || 3000,
    hostname: Deno.env.get('HOST') || '0.0.0.0',
  },
  app.fetch,
);

Deno.addSignalListener('SIGTERM', async () => {
  console.info('SIGTERM signal received.');
  console.log('Closing http server.');
  await server.shutdown();

  console.log('Http server closed.');

  redisClient.destroyRedis();
});
