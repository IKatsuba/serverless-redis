import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('set: sadd/smembers/scard', async ({ redis }) => {
  assertEquals(await redis.sadd('s', 'a', 'b', 'c'), 3);
  const members = (await redis.smembers<string[]>('s')).sort();
  assertEquals(members, ['a', 'b', 'c']);
  assertEquals(await redis.scard('s'), 3);
});

testWithServer('set: srem + sismember', async ({ redis }) => {
  await redis.sadd('s', 'a', 'b', 'c');
  assertEquals(await redis.sismember('s', 'a'), 1);
  assertEquals(await redis.srem('s', 'a'), 1);
  assertEquals(await redis.sismember('s', 'a'), 0);
});

testWithServer('set: sinter/sunion/sdiff', async ({ redis }) => {
  await redis.sadd('a', 'x', 'y', 'z');
  await redis.sadd('b', 'y', 'z', 'w');
  assertEquals(((await redis.sinter('a', 'b')) as string[]).sort(), [
    'y',
    'z',
  ]);
  assertEquals(((await redis.sunion('a', 'b')) as string[]).sort(), [
    'w',
    'x',
    'y',
    'z',
  ]);
  assertEquals(await redis.sdiff('a', 'b'), ['x']);
});

testWithServer('set: spop', async ({ redis }) => {
  await redis.sadd('s', 'only');
  assertEquals(await redis.spop<string>('s'), 'only');
  assertEquals(await redis.scard('s'), 0);
});

testWithServer('set: srandmember', async ({ redis }) => {
  await redis.sadd('s', 'a', 'b', 'c');
  const member = await redis.srandmember<string>('s');
  assertEquals(['a', 'b', 'c'].includes(member as string), true);
});

testWithServer('set: smove', async ({ redis }) => {
  await redis.sadd('src', 'x', 'y');
  await redis.sadd('dst', 'z');
  assertEquals(await redis.smove('src', 'dst', 'x'), 1);
  assertEquals((await redis.smembers<string[]>('src')).sort(), ['y']);
  assertEquals((await redis.smembers<string[]>('dst')).sort(), ['x', 'z']);
});
