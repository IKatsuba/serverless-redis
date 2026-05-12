import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer(
  'auto-pipelining: parallel commands batched by client',
  async ({ redis }) => {
    const [setA, setB, incr1, incr2] = await Promise.all([
      redis.set('a', 'alpha'),
      redis.set('b', 'beta'),
      redis.incr('counter'),
      redis.incr('counter'),
    ]);
    assertEquals(setA, 'OK');
    assertEquals(setB, 'OK');
    assertEquals([incr1, incr2].sort(), [1, 2]);

    const [a, b, counterAfter] = await Promise.all([
      redis.get<string>('a'),
      redis.get<string>('b'),
      redis.incr('counter'),
    ]);
    assertEquals(a, 'alpha');
    assertEquals(b, 'beta');
    assertEquals(counterAfter, 3);
  },
  { enableAutoPipelining: true },
);

testWithServer(
  'auto-pipelining: hash + list mixed under autopipeline',
  async ({ redis }) => {
    await Promise.all([
      redis.hset('h', { a: 'alpha', b: 'beta' }),
      redis.rpush('l', 'x', 'y', 'z'),
    ]);

    const [hash, list, hlen, llen] = await Promise.all([
      redis.hgetall<Record<string, string>>('h'),
      redis.lrange<string>('l', 0, -1),
      redis.hlen('h'),
      redis.llen('l'),
    ]);
    assertEquals(hash, { a: 'alpha', b: 'beta' });
    assertEquals(list, ['x', 'y', 'z']);
    assertEquals(hlen, 2);
    assertEquals(llen, 3);
  },
  { enableAutoPipelining: true },
);
