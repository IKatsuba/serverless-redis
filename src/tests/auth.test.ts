import { Redis } from '@upstash/redis';
import { assertEquals, assertRejects } from '@std/assert';

import { startTestServer } from '../test-utils.ts';

Deno.test({
  name: 'auth: rejects request with wrong token',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, close } = await startTestServer({ token: 'correct-token' });
    try {
      const wrong = new Redis({
        url,
        token: 'wrong-token',
        enableAutoPipelining: false,
        enableTelemetry: false,
      });
      await assertRejects(() => wrong.set('k', 'v'));
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'auth: rejects request without token',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, close } = await startTestServer({ token: 'correct-token' });
    try {
      const res = await fetch(`${url}/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(['SET', 'k', 'v']),
      });
      assertEquals(res.status, 401);
      await res.body?.cancel();
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'auth: accepts request with correct token',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { redis, close } = await startTestServer({ token: 'correct-token' });
    try {
      assertEquals(await redis.set('k', 'v'), 'OK');
    } finally {
      await close();
    }
  },
});
