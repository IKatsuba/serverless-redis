import { assertEquals } from '@std/assert';

import { rawCall, startTestServer } from '../test-utils.ts';

Deno.test({
  name: 'streams: XADD returns an id and XLEN counts entries',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      const id1 = await rawCall(ctx, [
        'XADD',
        'stream',
        '*',
        'sensor',
        'temp',
        'value',
        '21',
      ]);
      assertEquals(typeof id1, 'string');
      const id2 = await rawCall(ctx, [
        'XADD',
        'stream',
        '*',
        'sensor',
        'temp',
        'value',
        '22',
      ]);
      assertEquals(typeof id2, 'string');
      assertEquals(await rawCall(ctx, ['XLEN', 'stream']), 2);
    } finally {
      await ctx.close();
    }
  },
});

Deno.test({
  name: 'streams: XRANGE returns entries with fields',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      await rawCall(ctx, ['XADD', 's', '*', 'f', 'v1']);
      await rawCall(ctx, ['XADD', 's', '*', 'f', 'v2']);
      const entries = (await rawCall(ctx, [
        'XRANGE',
        's',
        '-',
        '+',
      ])) as unknown[];
      assertEquals(entries.length, 2);
    } finally {
      await ctx.close();
    }
  },
});

Deno.test({
  name: 'streams: XREAD returns entries for a given stream',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      await rawCall(ctx, ['XADD', 's', '*', 'f', 'v1']);
      const result = (await rawCall(ctx, [
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
      await ctx.close();
    }
  },
});
