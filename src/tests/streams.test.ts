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
  name: 'streams: XADD returns an id and XLEN counts entries',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const id1 = await call(url, token, [
        'XADD',
        'stream',
        '*',
        'sensor',
        'temp',
        'value',
        '21',
      ]);
      assertEquals(typeof id1, 'string');
      const id2 = await call(url, token, [
        'XADD',
        'stream',
        '*',
        'sensor',
        'temp',
        'value',
        '22',
      ]);
      assertEquals(typeof id2, 'string');
      assertEquals(await call(url, token, ['XLEN', 'stream']), 2);
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'streams: XRANGE returns entries with fields',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      await call(url, token, ['XADD', 's', '*', 'f', 'v1']);
      await call(url, token, ['XADD', 's', '*', 'f', 'v2']);
      const entries = (await call(url, token, [
        'XRANGE',
        's',
        '-',
        '+',
      ])) as unknown[];
      assertEquals(entries.length, 2);
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'streams: XREAD returns entries for a given stream',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      await call(url, token, ['XADD', 's', '*', 'f', 'v1']);
      const result = (await call(url, token, [
        'XREAD',
        'COUNT',
        10,
        'STREAMS',
        's',
        '0',
      ])) as unknown[];
      assertEquals(Array.isArray(result), true);
      assertEquals(result.length >= 1, true);
    } finally {
      await close();
    }
  },
});
