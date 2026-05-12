import { assertEquals } from '@std/assert';

import { startTestServer } from '../test-utils.ts';

async function call(
  url: string,
  token: string,
  command: (string | number)[],
): Promise<unknown> {
  const res = await fetch(`${url}/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(command),
  });
  const body = await res.json();
  if (res.status !== 200) {
    throw new Error(`HTTP ${res.status}: ${body.error}`);
  }
  return body.result;
}

Deno.test({
  name: 'scripting: EVAL returns scalar result',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const result = await call(url, token, [
        'EVAL',
        'return KEYS[1]',
        1,
        'mykey',
      ]);
      assertEquals(result, 'mykey');
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'scripting: EVAL can read keys via redis.call',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      await call(url, token, ['SET', 'k', 'stored-value']);
      const result = await call(url, token, [
        'EVAL',
        "return redis.call('GET', KEYS[1])",
        1,
        'k',
      ]);
      assertEquals(result, 'stored-value');
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'scripting: SCRIPT LOAD + EVALSHA round-trip',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      await call(url, token, ['SET', 'k', '42']);
      const sha = await call(url, token, [
        'SCRIPT',
        'LOAD',
        "return redis.call('GET', KEYS[1])",
      ]);
      assertEquals(typeof sha, 'string');
      const result = await call(url, token, [
        'EVALSHA',
        sha as string,
        1,
        'k',
      ]);
      assertEquals(result, '42');
    } finally {
      await close();
    }
  },
});
