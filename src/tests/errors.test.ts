import { assertEquals, assertRejects } from '@std/assert';

import { startTestServer, testWithServer } from '../test-utils.ts';

testWithServer(
  'errors: INCR on non-numeric value rejects',
  async ({ redis }) => {
    await redis.set('k', 'not-a-number');
    await assertRejects(() => redis.incr('k'), Error, 'not an integer');
  },
);

testWithServer(
  'errors: LPUSH on a string key rejects (WRONGTYPE)',
  async ({ redis }) => {
    await redis.set('k', 'string-value');
    await assertRejects(() => redis.lpush('k', 'x'), Error, 'WRONGTYPE');
  },
);

Deno.test({
  name: 'errors: unknown command returns HTTP 400 with {error}',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const res = await fetch(`${url}/`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(['DOESNOTEXIST', 'arg']),
      });
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(typeof body.error, 'string');
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'errors: non-array body returns HTTP 400 with {error}',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const res = await fetch(`${url}/`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ command: 'SET', key: 'k', value: 'v' }),
      });
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(typeof body.error, 'string');
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'errors: SET with missing args returns HTTP 400 with {error}',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const res = await fetch(`${url}/`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(['SET']),
      });
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(typeof body.error, 'string');
    } finally {
      await close();
    }
  },
});
