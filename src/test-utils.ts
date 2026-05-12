import { Redis } from '@upstash/redis';

import { createApp } from './app.ts';
import { redisClient } from './lib/redis-client.ts';

export interface TestServer {
  url: string;
  token: string;
  redis: Redis;
  server: Deno.HttpServer<Deno.NetAddr>;
  close: () => Promise<void>;
}

export interface StartTestServerOptions {
  token?: string;
  enableAutoPipelining?: boolean;
}

export async function startTestServer(
  options: StartTestServerOptions = {},
): Promise<TestServer> {
  const token = options.token ?? 'test-token';
  Deno.env.set('SR_TOKEN', token);

  const app = createApp({ enableLogger: false });

  const server = Deno.serve({
    port: 0,
    hostname: '127.0.0.1',
    onListen: () => {},
  }, app.fetch);

  const { port } = server.addr;
  const url = `http://127.0.0.1:${port}`;

  const redis = new Redis({
    url,
    token,
    enableAutoPipelining: options.enableAutoPipelining ?? false,
    enableTelemetry: false,
  });

  await redis.flushdb();

  return {
    url,
    token,
    redis,
    server,
    close: async () => {
      await server.shutdown();
    },
  };
}

export function destroyBackendRedis(): void {
  redisClient.destroyRedis();
}

export function testWithServer(
  name: string,
  fn: (ctx: TestServer) => Promise<void> | void,
  options: StartTestServerOptions = {},
): void {
  Deno.test({
    name,
    sanitizeOps: false,
    sanitizeResources: false,
    fn: async () => {
      const ctx = await startTestServer(options);
      try {
        await fn(ctx);
      } finally {
        await ctx.close();
      }
    },
  });
}
