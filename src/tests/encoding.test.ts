import { Redis } from '@upstash/redis';
import { assertEquals } from '@std/assert';

import { startTestServer } from '../test-utils.ts';

Deno.test({
  name: 'encoding: client with base64 (default) round-trips strings',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, redis, close } = await startTestServer();
    try {
      const value = 'hello: world / spaces & symbols + base64?';
      await redis.set('k', value);
      assertEquals(await redis.get<string>('k'), value);

      const raw = await fetch(`${url}/`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
          'Upstash-Encoding': 'base64',
        },
        body: JSON.stringify(['GET', 'k']),
      });
      const body = await raw.json();
      const decoded = atob(body.result);
      assertEquals(decoded, value);
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'encoding: client without base64 returns plain strings',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const plain = new Redis({
        url,
        token,
        responseEncoding: false,
        enableAutoPipelining: false,
        enableTelemetry: false,
      });
      await plain.set('k', 'plain-text');
      assertEquals(await plain.get<string>('k'), 'plain-text');

      const raw = await fetch(`${url}/`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(['GET', 'k']),
      });
      const body = await raw.json();
      assertEquals(body.result, 'plain-text');
    } finally {
      await close();
    }
  },
});
