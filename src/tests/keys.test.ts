import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('keys: exists + del-multi', async ({ redis }) => {
  await redis.set('a', '1');
  await redis.set('b', '2');
  assertEquals(await redis.exists('a', 'b', 'missing'), 2);
  assertEquals(await redis.del('a', 'b'), 2);
  assertEquals(await redis.exists('a'), 0);
});

testWithServer('keys: expire + ttl + persist', async ({ redis }) => {
  await redis.set('k', 'v');
  assertEquals(await redis.ttl('k'), -1);
  assertEquals(await redis.expire('k', 60), 1);
  const ttl = await redis.ttl('k');
  assertEquals(ttl > 0 && ttl <= 60, true);
  assertEquals(await redis.persist('k'), 1);
  assertEquals(await redis.ttl('k'), -1);
});

testWithServer('keys: rename', async ({ redis }) => {
  await redis.set('a', 'value');
  assertEquals(await redis.rename('a', 'b'), 'OK');
  assertEquals(await redis.get<string>('b'), 'value');
  assertEquals(await redis.exists('a'), 0);
});

testWithServer('keys: type', async ({ redis }) => {
  await redis.set('s', 'v');
  await redis.lpush('l', 'x');
  await redis.sadd('set', 'y');
  await redis.hset('h', { f: 'v' });
  assertEquals(await redis.type('s'), 'string');
  assertEquals(await redis.type('l'), 'list');
  assertEquals(await redis.type('set'), 'set');
  assertEquals(await redis.type('h'), 'hash');
  assertEquals(await redis.type('missing'), 'none');
});

testWithServer('keys: keys (pattern match)', async ({ redis }) => {
  await redis.mset({ 'user:1': 'a', 'user:2': 'b', 'post:1': 'c' });
  const users = (await redis.keys('user:*')).sort();
  assertEquals(users, ['user:1', 'user:2']);
});

testWithServer('keys: scan', async ({ redis }) => {
  await redis.mset({ k1: 'a', k2: 'b', k3: 'c' });
  const collected: string[] = [];
  let cursor: string | number = 0;
  do {
    const result: [string | number, string[]] = await redis.scan(cursor, {
      count: 100,
    });
    collected.push(...result[1]);
    cursor = result[0];
  } while (cursor !== '0' && cursor !== 0);
  assertEquals(collected.sort(), ['k1', 'k2', 'k3']);
});

testWithServer('keys: pexpire + pttl', async ({ redis }) => {
  await redis.set('k', 'v');
  assertEquals(await redis.pexpire('k', 60_000), 1);
  const pttl = await redis.pttl('k');
  assertEquals(pttl > 0 && pttl <= 60_000, true);
});
