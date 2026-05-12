import { assertEquals } from '@std/assert';

import { rawCall, startTestServer } from '../test-utils.ts';

Deno.test({
  name: 'scripting: EVAL returns scalar result',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      const result = await rawCall(ctx, [
        'EVAL',
        'return KEYS[1]',
        1,
        'mykey',
      ]);
      assertEquals(result, 'mykey');
    } finally {
      await ctx.close();
    }
  },
});

Deno.test({
  name: 'scripting: EVAL can read keys via redis.call',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      await rawCall(ctx, ['SET', 'k', 'stored-value']);
      const result = await rawCall(ctx, [
        'EVAL',
        "return redis.call('GET', KEYS[1])",
        1,
        'k',
      ]);
      assertEquals(result, 'stored-value');
    } finally {
      await ctx.close();
    }
  },
});

Deno.test({
  name: 'scripting: SCRIPT LOAD + EVALSHA round-trip',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      await rawCall(ctx, ['SET', 'k', '42']);
      const sha = await rawCall(ctx, [
        'SCRIPT',
        'LOAD',
        "return redis.call('GET', KEYS[1])",
      ]);
      assertEquals(typeof sha, 'string');
      const result = await rawCall(ctx, [
        'EVALSHA',
        sha as string,
        1,
        'k',
      ]);
      assertEquals(result, '42');
    } finally {
      await ctx.close();
    }
  },
});
