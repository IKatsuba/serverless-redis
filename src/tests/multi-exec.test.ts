import { assertEquals } from '@std/assert';

import { startTestServer, testWithServer } from '../test-utils.ts';

testWithServer('multi-exec: basic transaction', async ({ redis }) => {
  const tx = redis.multi();
  tx.set('k', 'v');
  tx.get('k');
  tx.incr('counter');
  tx.incr('counter');
  const results = await tx.exec();
  assertEquals(results, ['OK', 'v', 1, 2]);
});

testWithServer('multi-exec: hash + list mixed', async ({ redis }) => {
  const tx = redis.multi();
  tx.hset('h', { a: 'alpha' });
  tx.hget('h', 'a');
  tx.rpush('l', 'x', 'y');
  tx.llen('l');
  const results = await tx.exec();
  assertEquals(results, [1, 'alpha', 2, 2]);
});

// Pins current non-atomic behaviour: /multi-exec runs commands sequentially
// through ioredis without WATCH/MULTI/EXEC framing. The first failing command
// aborts the rest, and prior successful commands stay committed. See the
// "Limitations" section in README.md.
Deno.test({
  name: 'multi-exec: not atomic — first error aborts, prior writes persist',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const res = await fetch(`${url}/multi-exec`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify([
          ['SET', 'persisted', 'before-error'],
          ['INCR', 'persisted'],
          ['SET', 'after-error', 'never-written'],
        ]),
      });
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(typeof body.error, 'string');

      const check = async (cmd: string[]) => {
        const r = await fetch(`${url}/`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(cmd),
        });
        return (await r.json()).result;
      };

      assertEquals(await check(['GET', 'persisted']), 'before-error');
      assertEquals(await check(['EXISTS', 'after-error']), 0);
    } finally {
      await close();
    }
  },
});
