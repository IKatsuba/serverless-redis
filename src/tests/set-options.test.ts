import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('set-options: ex sets seconds-level TTL', async ({ redis }) => {
  await redis.set('k', 'v', { ex: 60 });
  const ttl = await redis.ttl('k');
  assertEquals(ttl > 0 && ttl <= 60, true);
});

testWithServer(
  'set-options: px sets millisecond-level TTL',
  async ({ redis }) => {
    await redis.set('k', 'v', { px: 60_000 });
    const pttl = await redis.pttl('k');
    assertEquals(pttl > 0 && pttl <= 60_000, true);
  },
);

testWithServer(
  'set-options: nx skips overwrite of existing key',
  async ({ redis }) => {
    await redis.set('k', 'first');
    const result = await redis.set('k', 'second', { nx: true });
    assertEquals(result, null);
    assertEquals(await redis.get<string>('k'), 'first');
  },
);

testWithServer(
  'set-options: nx writes when key is missing',
  async ({ redis }) => {
    const result = await redis.set('k', 'first', { nx: true });
    assertEquals(result, 'OK');
    assertEquals(await redis.get<string>('k'), 'first');
  },
);

testWithServer(
  'set-options: xx writes only when key exists',
  async ({ redis }) => {
    const missing = await redis.set('k', 'v', { xx: true });
    assertEquals(missing, null);
    await redis.set('k', 'original');
    const overwrite = await redis.set('k', 'updated', { xx: true });
    assertEquals(overwrite, 'OK');
    assertEquals(await redis.get<string>('k'), 'updated');
  },
);

testWithServer(
  'set-options: keepTtl preserves existing TTL',
  async ({ redis }) => {
    await redis.set('k', 'v', { ex: 120 });
    const before = await redis.ttl('k');
    await redis.set('k', 'new', { keepTtl: true });
    const after = await redis.ttl('k');
    assertEquals(after > 0 && after <= before, true);
    assertEquals(await redis.get<string>('k'), 'new');
  },
);
