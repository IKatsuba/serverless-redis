import { assertEquals } from '@std/assert';

import { startTestServer } from '../test-utils.ts';

async function post(url: string, token: string, body: unknown, path = '/') {
  return await fetch(`${url}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

Deno.test({
  name: 'response-shape: single OK command returns {result}',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const res = await post(url, token, ['SET', 'k', 'v']);
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(body, { result: 'OK' });
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'response-shape: single error returns {error} with status 400',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      await post(url, token, ['SET', 'k', 'string']);
      const res = await post(url, token, ['INCR', 'k']);
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(typeof body.error, 'string');
    } finally {
      await close();
    }
  },
});

Deno.test({
  name:
    'response-shape: pipeline of OK commands returns array of {status,result}',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const res = await post(url, token, [
        ['SET', 'k1', 'v1'],
        ['GET', 'k1'],
        ['INCR', 'counter'],
      ], '/pipeline');
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(Array.isArray(body), true);
      assertEquals(body, [
        { status: 'ok', result: 'OK' },
        { status: 'ok', result: 'v1' },
        { status: 'ok', result: 1 },
      ]);
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'response-shape: pipeline aborts on first error (current behaviour)',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const res = await post(url, token, [
        ['SET', 'k', 'plain'],
        ['INCR', 'k'],
        ['SET', 'after-error', 'should-not-run'],
      ], '/pipeline');
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(typeof body.error, 'string');

      const check = await post(url, token, ['EXISTS', 'after-error']);
      const checkBody = await check.json();
      assertEquals(checkBody, { result: 0 });

      const first = await post(url, token, ['GET', 'k']);
      assertEquals((await first.json()).result, 'plain');
    } finally {
      await close();
    }
  },
});
