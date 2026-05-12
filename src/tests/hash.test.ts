import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('hash: hset/hget', async ({ redis }) => {
  assertEquals(await redis.hset('h', { field1: 'value1' }), 1);
  assertEquals(await redis.hget<string>('h', 'field1'), 'value1');
  assertEquals(await redis.hget('h', 'missing'), null);
});

testWithServer('hash: hgetall', async ({ redis }) => {
  await redis.hset('h', { a: 'alpha', b: 'beta', c: 'gamma' });
  const all = await redis.hgetall<Record<string, string>>('h');
  assertEquals(all, { a: 'alpha', b: 'beta', c: 'gamma' });
});

testWithServer('hash: hdel + hexists', async ({ redis }) => {
  await redis.hset('h', { a: 'alpha', b: 'beta' });
  assertEquals(await redis.hexists('h', 'a'), 1);
  assertEquals(await redis.hdel('h', 'a'), 1);
  assertEquals(await redis.hexists('h', 'a'), 0);
});

testWithServer('hash: hincrby', async ({ redis }) => {
  await redis.hset('h', { counter: 10 });
  assertEquals(await redis.hincrby('h', 'counter', 5), 15);
  assertEquals(await redis.hincrby('h', 'counter', -3), 12);
});

testWithServer('hash: hkeys + hvals + hlen', async ({ redis }) => {
  await redis.hset('h', { a: 'alpha', b: 'beta' });
  const keys = (await redis.hkeys('h')).sort();
  assertEquals(keys, ['a', 'b']);
  const vals = ((await redis.hvals('h')) as string[]).sort();
  assertEquals(vals, ['alpha', 'beta']);
  assertEquals(await redis.hlen('h'), 2);
});

testWithServer('hash: hmget', async ({ redis }) => {
  await redis.hset('h', { a: 'alpha', b: 'beta', c: 'gamma' });
  assertEquals(await redis.hmget<Record<string, string>>('h', 'a', 'c'), {
    a: 'alpha',
    c: 'gamma',
  });
});

testWithServer('hash: hsetnx', async ({ redis }) => {
  assertEquals(await redis.hsetnx('h', 'f', 'first'), 1);
  assertEquals(await redis.hsetnx('h', 'f', 'second'), 0);
  assertEquals(await redis.hget<string>('h', 'f'), 'first');
});

testWithServer('hash: hincrbyfloat', async ({ redis }) => {
  await redis.hset('h', { rate: '1.5' });
  assertEquals(await redis.hincrbyfloat('h', 'rate', 0.5), 2);
});
