import { createApp } from './app.ts';
import { redisClient } from './lib/redis-client.ts';

const app = createApp();

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
