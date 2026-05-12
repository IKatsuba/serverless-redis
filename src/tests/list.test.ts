import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('list: lpush/rpush/lrange', async ({ redis }) => {
  assertEquals(await redis.rpush('l', 'a', 'b', 'c'), 3);
  assertEquals(await redis.lpush('l', 'z'), 4);
  assertEquals(await redis.lrange<string>('l', 0, -1), ['z', 'a', 'b', 'c']);
});

testWithServer('list: lpop/rpop', async ({ redis }) => {
  await redis.rpush('l', 'a', 'b', 'c');
  assertEquals(await redis.lpop<string>('l'), 'a');
  assertEquals(await redis.rpop<string>('l'), 'c');
  assertEquals(await redis.lrange<string>('l', 0, -1), ['b']);
});

testWithServer('list: llen + lindex', async ({ redis }) => {
  await redis.rpush('l', 'a', 'b', 'c');
  assertEquals(await redis.llen('l'), 3);
  assertEquals(await redis.lindex('l', 0), 'a');
  assertEquals(await redis.lindex('l', -1), 'c');
});

testWithServer('list: lset', async ({ redis }) => {
  await redis.rpush('l', 'a', 'b', 'c');
  assertEquals(await redis.lset('l', 1, 'B'), 'OK');
  assertEquals(await redis.lrange<string>('l', 0, -1), ['a', 'B', 'c']);
});

testWithServer('list: lrem', async ({ redis }) => {
  await redis.rpush('l', 'a', 'b', 'a', 'c', 'a');
  assertEquals(await redis.lrem('l', 2, 'a'), 2);
  assertEquals(await redis.lrange<string>('l', 0, -1), ['b', 'c', 'a']);
});

testWithServer('list: ltrim', async ({ redis }) => {
  await redis.rpush('l', 'v0', 'v1', 'v2', 'v3', 'v4');
  assertEquals(await redis.ltrim('l', 1, 3), 'OK');
  assertEquals(await redis.lrange<string>('l', 0, -1), ['v1', 'v2', 'v3']);
});

testWithServer('list: linsert', async ({ redis }) => {
  await redis.rpush('l', 'a', 'c');
  assertEquals(await redis.linsert('l', 'before', 'c', 'b'), 3);
  assertEquals(await redis.lrange<string>('l', 0, -1), ['a', 'b', 'c']);
});
