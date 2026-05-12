import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('zset: zadd + zcard + zscore', async ({ redis }) => {
  assertEquals(
    await redis.zadd('z', { score: 1, member: 'a' }, { score: 2, member: 'b' }),
    2,
  );
  assertEquals(await redis.zcard('z'), 2);
  assertEquals(await redis.zscore('z', 'a'), 1);
});

testWithServer('zset: zrange', async ({ redis }) => {
  await redis.zadd(
    'z',
    { score: 1, member: 'a' },
    { score: 2, member: 'b' },
    { score: 3, member: 'c' },
  );
  assertEquals(await redis.zrange<string[]>('z', 0, -1), ['a', 'b', 'c']);
  assertEquals(await redis.zrange<string[]>('z', 0, -1, { rev: true }), [
    'c',
    'b',
    'a',
  ]);
});

testWithServer('zset: zrangebyscore', async ({ redis }) => {
  await redis.zadd(
    'z',
    { score: 1, member: 'a' },
    { score: 5, member: 'b' },
    { score: 10, member: 'c' },
  );
  assertEquals(await redis.zrange<string[]>('z', 2, 8, { byScore: true }), [
    'b',
  ]);
});

testWithServer('zset: zrem', async ({ redis }) => {
  await redis.zadd('z', { score: 1, member: 'a' }, { score: 2, member: 'b' });
  assertEquals(await redis.zrem('z', 'a'), 1);
  assertEquals(await redis.zcard('z'), 1);
});

testWithServer('zset: zincrby', async ({ redis }) => {
  await redis.zadd('z', { score: 1, member: 'a' });
  assertEquals(await redis.zincrby('z', 4, 'a'), 5);
});

testWithServer('zset: zrank + zrevrank', async ({ redis }) => {
  await redis.zadd(
    'z',
    { score: 1, member: 'a' },
    { score: 2, member: 'b' },
    { score: 3, member: 'c' },
  );
  assertEquals(await redis.zrank('z', 'a'), 0);
  assertEquals(await redis.zrevrank('z', 'a'), 2);
});

testWithServer('zset: zcount', async ({ redis }) => {
  await redis.zadd(
    'z',
    { score: 1, member: 'a' },
    { score: 5, member: 'b' },
    { score: 10, member: 'c' },
  );
  assertEquals(await redis.zcount('z', 1, 5), 2);
});
