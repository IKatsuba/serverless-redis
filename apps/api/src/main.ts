import { Hono } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

import {
  handleCommand,
  handleCommandArray,
  handleCommandTransactionArray,
} from './lib/handle-command';
import { handler } from './lib/handler';
import { redisClient } from './lib/redis-client';
import { responseFactory } from './lib/response-factory';

const app = new Hono();

app.use(
  '/*',
  bearerAuth({
    token: process.env.SR_TOKEN,
  }),
);
app.use(logger());

app.get('/', () =>
  responseFactory({
    status: 'ok',
    result: 'Welcome to HTTP Redis!',
  }),
);

app.get('/ping', (c) => c.text('Pong'));

app.post('/', handler(handleCommand));
app.post('/pipeline', handler(handleCommandArray));
app.post('/multi-exec', handler(handleCommandTransactionArray));

const server = serve(
  {
    ...app,
    port: Number(process.env.PORT) || 3000,
  },
  (info) => {
    console.log(`Server is listening on http://localhost:${info.port}`);
  },
);

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  console.log('Closing http server.');
  server.close(() => {
    console.log('Http server closed.');

    redisClient.destroyRedis();

    process.exit(0);
  });
});
