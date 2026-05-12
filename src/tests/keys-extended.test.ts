import { assertEquals } from '@std/assert';

import { rawCall, startTestServer, testWithServer } from '../test-utils.ts';

testWithServer(
  'keys-extended: SCAN with MATCH + COUNT filters',
  async ({ redis }) => {
    await redis.mset({
      'user:1': 'a',
      'user:2': 'b',
      'user:3': 'c',
      'post:1': 'x',
      'post:2': 'y',
    });
    const collected: string[] = [];
    let cursor: string | number = 0;
    do {
      const result: [string | number, string[]] = await redis.scan(cursor, {
        match: 'user:*',
        count: 100,
      });
      collected.push(...result[1]);
      cursor = result[0];
    } while (cursor !== '0' && cursor !== 0);
    assertEquals(collected.sort(), ['user:1', 'user:2', 'user:3']);
  },
);

testWithServer('keys-extended: SCAN with TYPE filter', async ({ redis }) => {
  await redis.set('s1', 'value');
  await redis.set('s2', 'value');
  await redis.lpush('l1', 'item');
  const collected: string[] = [];
  let cursor: string | number = 0;
  do {
    const result: [string | number, string[]] = await redis.scan(cursor, {
      count: 100,
      type: 'string',
    });
    collected.push(...result[1]);
    cursor = result[0];
  } while (cursor !== '0' && cursor !== 0);
  assertEquals(collected.sort(), ['s1', 's2']);
});

Deno.test({
  name: 'keys-extended: EXPIRE with NX/XX/GT/LT modifiers',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      await rawCall(ctx, ['SET', 'k', 'v']);

      assertEquals(await rawCall(ctx, ['EXPIRE', 'k', 60, 'NX']), 1);
      assertEquals(await rawCall(ctx, ['EXPIRE', 'k', 30, 'NX']), 0);

      assertEquals(await rawCall(ctx, ['EXPIRE', 'k', 90, 'XX']), 1);
      assertEquals(await rawCall(ctx, ['EXPIRE', 'k', 120, 'GT']), 1);
      assertEquals(await rawCall(ctx, ['EXPIRE', 'k', 30, 'GT']), 0);
      assertEquals(await rawCall(ctx, ['EXPIRE', 'k', 10, 'LT']), 1);
      assertEquals(await rawCall(ctx, ['EXPIRE', 'k', 200, 'LT']), 0);
    } finally {
      await ctx.close();
    }
  },
});

Deno.test({
  name: 'keys-extended: COPY duplicates a key',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      await rawCall(ctx, ['SET', 'src', 'value']);
      assertEquals(await rawCall(ctx, ['COPY', 'src', 'dst']), 1);
      assertEquals(await rawCall(ctx, ['GET', 'dst']), 'value');
      assertEquals(await rawCall(ctx, ['COPY', 'src', 'dst']), 0);
      assertEquals(
        await rawCall(ctx, ['COPY', 'src', 'dst', 'REPLACE']),
        1,
      );
    } finally {
      await ctx.close();
    }
  },
});

Deno.test({
  name: 'keys-extended: OBJECT ENCODING returns a string per data type',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      await rawCall(ctx, ['SET', 's', 'short']);
      await rawCall(ctx, ['HSET', 'h', 'f', 'v']);

      const stringEnc = await rawCall(ctx, ['OBJECT', 'ENCODING', 's']);
      const hashEnc = await rawCall(ctx, ['OBJECT', 'ENCODING', 'h']);
      assertEquals(typeof stringEnc, 'string');
      assertEquals(typeof hashEnc, 'string');
    } finally {
      await ctx.close();
    }
  },
});
