import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('bitops: setbit/getbit round-trip', async ({ redis }) => {
  assertEquals(await redis.setbit('bits', 7, 1), 0);
  assertEquals(await redis.getbit('bits', 7), 1);
  assertEquals(await redis.getbit('bits', 0), 0);
  assertEquals(await redis.setbit('bits', 7, 0), 1);
  assertEquals(await redis.getbit('bits', 7), 0);
});

testWithServer('bitops: bitcount over a known value', async ({ redis }) => {
  await redis.set('k', 'foobar');
  assertEquals(await redis.bitcount('k', 0, -1), 26);
  assertEquals(await redis.bitcount('k', 1, 1), 6);
});

testWithServer('bitops: bitop AND/OR/XOR', async ({ redis }) => {
  await redis.set('a', 'abc');
  await redis.set('b', 'abd');
  assertEquals(await redis.bitop('and', 'and_dst', 'a', 'b'), 3);
  assertEquals(await redis.bitop('or', 'or_dst', 'a', 'b'), 3);
  assertEquals(await redis.bitop('xor', 'xor_dst', 'a', 'b'), 3);

  assertEquals(await redis.get<string>('and_dst'), 'ab`');
  assertEquals(await redis.get<string>('or_dst'), 'abg');
});
